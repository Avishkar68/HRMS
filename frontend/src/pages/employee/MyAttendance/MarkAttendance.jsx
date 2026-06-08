import React, { useEffect, useState } from "react";
import api from "../../../utils/api";
import { 
  Clock, 
  Calendar, 
  MapPin, 
  UserCheck, 
  LogOut, 
  Compass, 
  Fingerprint, 
  Timer, 
  CheckCircle2, 
  Map, 
  AlertCircle, 
  MapPinOff,
  Briefcase
} from "lucide-react";

const MarkAttendance = () => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [punchLoading, setPunchLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [gpsStatus, setGpsStatus] = useState("idle"); // idle, acquiring, active, failed
  const [coords, setCoords] = useState(null);

  // Live clock update
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const res = await api.get("/attendance/today");
      setStatus(res.data);
      if (res.data && res.data.location) {
        setCoords(res.data.location);
        setGpsStatus("active");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleCheckIn = async () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    
    setPunchLoading(true);
    setGpsStatus("acquiring");

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const locationData = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        };
        setCoords(locationData);
        setGpsStatus("active");

        try {
          await api.post("/attendance/check-in", locationData);
          await fetchStatus();
        } catch (err) {
          alert(err.response?.data?.message || "Check-in failed");
          setGpsStatus("failed");
        } finally {
          setPunchLoading(false);
        }
      },
      (error) => {
        alert("Location permission is required to check in. Please enable GPS and allow location access.");
        setGpsStatus("failed");
        setPunchLoading(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  const handleCheckOut = async () => {
    setPunchLoading(true);
    try {
      await api.post("/attendance/check-out", {});
      await fetchStatus();
    } catch (err) {
      alert(err.response?.data?.message || "Check-out failed");
    } finally {
      setPunchLoading(false);
    }
  };

  // Helper to calculate duration
  const calculateWorkDuration = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return null;
    try {
      const parseTime = (timeStr) => {
        const parts = timeStr.match(/^(\d+):(\d+):?(\d+)?\s*(AM|PM)?$/i);
        if (!parts) return null;
        let hrs = parseInt(parts[1], 10);
        const mins = parseInt(parts[2], 10);
        const ampm = parts[4];
        if (ampm) {
          if (ampm.toUpperCase() === "PM" && hrs < 12) hrs += 12;
          if (ampm.toUpperCase() === "AM" && hrs === 12) hrs = 0;
        }
        return hrs * 60 + mins;
      };
      const inMins = parseTime(checkIn);
      const outMins = parseTime(checkOut);
      if (inMins === null || outMins === null) return null;
      let diff = outMins - inMins;
      if (diff < 0) diff += 24 * 60;
      const hrs = Math.floor(diff / 60);
      const mins = diff % 60;
      return `${hrs}h ${mins}m`;
    } catch (e) {
      return null;
    }
  };

  const formatClockTime = (date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true
    });
  };

  const formatLocalDate = (date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  const isCheckedIn = !!status && status.status !== "on_leave";
  const isCheckedOut = isCheckedIn && !!status.checkOutTime;
  const isOnLeave = !!status && status.status === "on_leave";

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Mark Attendance</h1>
        <p className="text-gray-500 text-sm mt-1">Record your daily attendance punches securely with geolocation verification</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left/Middle Column - Clock and Punch button */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Main Clock Card */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden p-6 md:p-8 flex flex-col items-center justify-center text-center relative">
            
            {/* Live Clock Display */}
            <div className="flex items-center gap-2 text-indigo-600 font-semibold text-sm uppercase tracking-widest bg-indigo-50 px-3 py-1.5 rounded-full mb-4">
              <Timer className="w-4 h-4 animate-spin-slow" />
              Live Time Server
            </div>
            
            <div className="text-4xl md:text-5xl font-black text-gray-900 tracking-wider font-mono">
              {formatClockTime(currentTime)}
            </div>
            
            <div className="text-sm font-semibold text-gray-400 mt-2 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-gray-300" />
              {formatLocalDate(currentTime)}
            </div>

            {/* Status Summary Banner */}
            <div className="mt-8 w-full max-w-sm">
              {isOnLeave && (
                <div className="bg-blue-50 border border-blue-200 text-blue-700 rounded-xl p-4 text-sm font-semibold flex items-center justify-center gap-2">
                  <AlertCircle className="w-5 h-5 text-blue-500" />
                  Approved Leave Registered for Today
                </div>
              )}

              {!status && !isOnLeave && (
                <div className="bg-gray-50 border border-gray-200 text-gray-500 rounded-xl p-4 text-sm font-semibold flex items-center justify-center gap-2">
                  <Fingerprint className="w-5 h-5 text-gray-400" />
                  Ready to check in for today's shift
                </div>
              )}

              {isCheckedIn && !isCheckedOut && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl p-4 text-sm font-semibold flex flex-col items-center gap-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                    <span>Currently Checked In</span>
                  </div>
                  <span className="text-xs text-emerald-500 font-medium">Started at {status.checkInTime}</span>
                </div>
              )}

              {isCheckedOut && (
                <div className="bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-xl p-4 text-sm font-semibold flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-indigo-500" />
                  Shift Completed Successfully
                </div>
              )}
            </div>

            {/* Big Premium Punch Button */}
            <div className="mt-8 w-full max-w-xs">
              {isOnLeave && (
                <button
                  disabled
                  className="w-full py-4 px-6 bg-gray-100 text-gray-400 rounded-2xl font-bold text-base border border-gray-200 flex items-center justify-center gap-2 cursor-not-allowed"
                >
                  <Briefcase className="w-5 h-5" />
                  On Leave Today
                </button>
              )}

              {!status && !isOnLeave && (
                <button
                  onClick={handleCheckIn}
                  disabled={punchLoading}
                  className={`w-full py-4 px-6 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-2xl font-bold text-base shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 ${
                    punchLoading ? "opacity-75 cursor-wait" : "cursor-pointer"
                  }`}
                >
                  {punchLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Fingerprint className="w-5 h-5 animate-pulse" />
                  )}
                  {punchLoading ? "Capturing GPS..." : "PUNCH IN NOW"}
                </button>
              )}

              {isCheckedIn && !isCheckedOut && (
                <button
                  onClick={handleCheckOut}
                  disabled={punchLoading}
                  className={`w-full py-4 px-6 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-2xl font-bold text-base shadow-lg shadow-amber-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 ${
                    punchLoading ? "opacity-75 cursor-wait" : "cursor-pointer"
                  }`}
                >
                  {punchLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <LogOut className="w-5 h-5" />
                  )}
                  {punchLoading ? "Processing..." : "PUNCH OUT NOW"}
                </button>
              )}

              {isCheckedOut && (
                <button
                  disabled
                  className="w-full py-4 px-6 bg-gray-100 text-gray-500 rounded-2xl font-bold text-base border border-gray-200 flex items-center justify-center gap-2 cursor-not-allowed shadow-inner"
                >
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  Checked Out (Done)
                </button>
              )}
            </div>

          </div>

          {/* Today's Log Timeline */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden p-6">
            <h3 className="font-bold text-gray-800 text-lg mb-6">Today's Activity Log</h3>
            
            <div className="relative pl-6 border-l-2 border-gray-100 space-y-6">
              
              {/* Check In Log */}
              <div className="relative">
                <span className={`absolute -left-[33px] top-0.5 w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                  isCheckedIn ? "bg-emerald-50 text-emerald-600 border border-emerald-200" : "bg-gray-100 text-gray-400 border border-gray-200"
                }`}>
                  1
                </span>
                <div>
                  <h4 className="font-bold text-sm text-gray-800">Check In</h4>
                  <p className="text-xs text-gray-400 font-medium">Captured start of the workday</p>
                  
                  {isCheckedIn ? (
                    <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-gray-50 border border-gray-100 text-xs font-bold text-gray-700">
                      <Clock className="w-3.5 h-3.5 text-emerald-500" />
                      {status.checkInTime}
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                        status.status === "late" ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"
                      }`}>
                        {status.status}
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-gray-400 italic block mt-1">Pending Check-in</span>
                  )}
                </div>
              </div>

              {/* Check Out Log */}
              <div className="relative">
                <span className={`absolute -left-[33px] top-0.5 w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                  isCheckedOut ? "bg-indigo-50 text-indigo-600 border border-indigo-200" : "bg-gray-100 text-gray-400 border border-gray-200"
                }`}>
                  2
                </span>
                <div>
                  <h4 className="font-bold text-sm text-gray-800">Check Out</h4>
                  <p className="text-xs text-gray-400 font-medium">Captured end of the workday</p>
                  
                  {isCheckedOut ? (
                    <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-gray-50 border border-gray-100 text-xs font-bold text-gray-700">
                      <LogOut className="w-3.5 h-3.5 text-indigo-500" />
                      {status.checkOutTime}
                    </div>
                  ) : (
                    <span className="text-xs text-gray-400 italic block mt-1">Pending Check-out</span>
                  )}
                </div>
              </div>

              {/* Total Worked Hours summary */}
              {isCheckedIn && isCheckedOut && (
                <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-sm">
                  <span className="font-bold text-gray-500">Total Worked Duration</span>
                  <span className="font-black text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100">
                    {calculateWorkDuration(status.checkInTime, status.checkOutTime) || "—"}
                  </span>
                </div>
              )}

            </div>
          </div>

        </div>

        {/* Right Column - Geolocation Status and Policy */}
        <div className="space-y-6">
          
          {/* GPS Connection status card */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden p-6 space-y-4">
            <h3 className="font-bold text-gray-800 text-base flex items-center gap-2">
              <Compass className="w-5 h-5 text-gray-500" />
              GPS Verification
            </h3>

            {/* GPS Pulse Indicator */}
            <div className="bg-gray-50 border border-gray-100 p-4 rounded-xl space-y-3">
              <div className="flex items-center gap-3">
                <span className={`w-3 h-3 rounded-full ${
                  gpsStatus === "acquiring" ? "bg-amber-500 animate-pulse" :
                  gpsStatus === "active" ? "bg-emerald-500" :
                  gpsStatus === "failed" ? "bg-rose-500" : "bg-gray-300"
                }`} />
                <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                  {gpsStatus === "acquiring" && "Acquiring GPS Signal..."}
                  {gpsStatus === "active" && "GPS Location Verified"}
                  {gpsStatus === "failed" && "GPS Verification Failed"}
                  {gpsStatus === "idle" && "Ready to Connect"}
                </span>
              </div>

              {coords ? (
                <div className="text-xs text-gray-600 space-y-1.5 font-mono border-t border-gray-200/50 pt-2.5">
                  <p className="flex justify-between"><span className="text-gray-400">Latitude:</span> {coords.lat.toFixed(6)}</p>
                  <p className="flex justify-between"><span className="text-gray-400">Longitude:</span> {coords.lng.toFixed(6)}</p>
                  {coords.accuracy && (
                    <p className="flex justify-between"><span className="text-gray-400">Accuracy:</span> ±{Math.round(coords.accuracy)} meters</p>
                  )}
                  
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${coords.lat},${coords.lng}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 pt-2 hover:underline font-sans"
                  >
                    <Map className="w-3.5 h-3.5" />
                    Preview location map
                  </a>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-xs text-gray-400 italic">
                  <MapPinOff className="w-4 h-4 text-gray-300" />
                  Coordinates will be captured on punch-in
                </div>
              )}
            </div>
          </div>

          {/* Attendance policy Guidelines card */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden p-6 space-y-4">
            <h3 className="font-bold text-gray-800 text-base flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-gray-500" />
              Shift Regulations
            </h3>
            
            <div className="space-y-4 text-xs">
              <div className="pb-3 border-b border-gray-100">
                <p className="font-bold text-gray-700">General Working Hours</p>
                <p className="text-gray-500 mt-0.5">09:00 AM - 06:00 PM (Monday to Friday)</p>
              </div>

              <div className="pb-3 border-b border-gray-100">
                <p className="font-bold text-gray-700">Late Attendance policy</p>
                <p className="text-gray-500 mt-0.5 leading-relaxed">
                  A grace period is allowed until 09:15 AM. Check-ins after this time will be classified as <strong className="text-amber-600 font-semibold">Late</strong>.
                </p>
              </div>

              <div>
                <p className="font-bold text-gray-700">Minimum Work Duration</p>
                <p className="text-gray-500 mt-0.5 leading-relaxed">
                  A minimum of 8 logged hours is required to complete a full working day. Fewer hours may require approval.
                </p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default MarkAttendance;
