import React, { useEffect, useState } from "react";
import api from "../../../utils/api";

const MarkAttendance = () => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const res = await api.get("/attendance/today");
      setStatus(res.data);
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
      alert("Geolocation not supported");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          await api.post("/attendance/check-in", {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
          });
          fetchStatus();
        } catch (err) {
          alert(err.response?.data?.message || "Check-in failed");
        }
      },
      () => alert("Location permission is required to check in"),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleCheckOut = async () => {
    try {
      await api.post("/attendance/check-out", {});
      fetchStatus();
    } catch (err) {
      alert(err.response?.data?.message || "Check-out failed");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mark Attendance</h1>
        <p className="text-gray-500 text-sm mt-1">Check in and check out for today</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden max-w-md">
        <div className="p-6 space-y-4">
          {status?.status === "on_leave" && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100 text-blue-800 text-sm">
              You are on approved leave today.
            </div>
          )}

          {!status && status?.status !== "on_leave" && (
            <button
              onClick={handleCheckIn}
              className="w-full py-3 px-4 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors"
            >
              Check In
            </button>
          )}

          {status && status.status !== "on_leave" && !status.checkOutTime && (
            <button
              onClick={handleCheckOut}
              className="w-full py-3 px-4 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 transition-colors"
            >
              Check Out
            </button>
          )}

          {status && status.status !== "on_leave" && (
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 text-sm space-y-2">
              <p><span className="font-medium text-gray-500">Check In:</span> {status.checkInTime || "—"}</p>
              <p><span className="font-medium text-gray-500">Check Out:</span> {status.checkOutTime || "—"}</p>
              <p><span className="font-medium text-gray-500">Status:</span> <span className="font-medium text-gray-900">{status.status}</span></p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MarkAttendance;
