import React, { useEffect, useState } from "react";
import api from "../../../utils/api";
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  MapPin, 
  Clock, 
  UserCheck, 
  XCircle, 
  CalendarDays,
  Percent,
  LogOut,
  MapPinOff,
  MapIcon
} from "lucide-react";

const Attendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);

  const fetchHistory = async () => {
    try {
      const res = await api.get(`/attendance/history?month=${month}`);
      setAttendance(res.data.attendance || []);
      setLeaves(res.data.leaves || []);
    } catch (error) {
      console.error("Error fetching attendance history:", error);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [month]);

  // Parse Year and Month
  const [year, monthNum] = month.split("-");
  const yearInt = parseInt(year, 10);
  const monthInt = parseInt(monthNum, 10);

  // Month Names
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const currentMonthName = monthNames[monthInt - 1];

  // Attendance and Leaves Mapping
  const attendanceMap = {};
  attendance.forEach((a) => {
    attendanceMap[a.date] = a;
  });

  const leaveDates = new Set();
  leaves.forEach((l) => {
    const start = new Date(l.fromDate);
    const end = new Date(l.toDate);
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      leaveDates.add(d.toISOString().split("T")[0]);
    }
  });

  // Calculate Calendar Days (42 cells grid)
  const firstDayOfMonth = new Date(yearInt, monthInt - 1, 1);
  const firstDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sunday, 1 = Monday
  const daysInCurrentMonth = new Date(yearInt, monthInt, 0).getDate();
  const daysInPrevMonth = new Date(yearInt, monthInt - 1, 0).getDate();

  const cells = [];

  // Previous month trailing days
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const dayVal = daysInPrevMonth - i;
    const prevMonthVal = monthInt - 1 === 0 ? 12 : monthInt - 1;
    const prevYearVal = monthInt - 1 === 0 ? yearInt - 1 : yearInt;
    const dateStr = `${prevYearVal}-${String(prevMonthVal).padStart(2, "0")}-${String(dayVal).padStart(2, "0")}`;
    cells.push({
      day: dayVal,
      dateStr,
      isCurrentMonth: false,
    });
  }

  // Current month days
  for (let i = 1; i <= daysInCurrentMonth; i++) {
    const dateStr = `${year}-${monthNum}-${String(i).padStart(2, "0")}`;
    cells.push({
      day: i,
      dateStr,
      isCurrentMonth: true,
    });
  }

  // Next month leading days
  const remainingCells = 42 - cells.length;
  for (let i = 1; i <= remainingCells; i++) {
    const nextMonthVal = monthInt + 1 === 13 ? 1 : monthInt + 1;
    const nextYearVal = monthInt + 1 === 13 ? yearInt + 1 : yearInt;
    const dateStr = `${nextYearVal}-${String(nextMonthVal).padStart(2, "0")}-${String(i).padStart(2, "0")}`;
    cells.push({
      day: i,
      dateStr,
      isCurrentMonth: false,
    });
  }

  // Get status for a specific date (only for current month)
  const getDayStatus = (dateStr) => {
    if (leaveDates.has(dateStr)) return "on_leave";
    if (attendanceMap[dateStr]) return attendanceMap[dateStr].status; // "present" or "late"

    const d = new Date(dateStr);
    const dayOfWeek = d.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    const todayStr = new Date().toISOString().split("T")[0];
    const isFuture = dateStr > todayStr;
    const isToday = dateStr === todayStr;

    if (isFuture) return "future";
    if (isToday) return "today-unmarked";
    if (isWeekend) return "weekend";
    return "absent";
  };

  // Status Styling Config
  const statusStyles = {
    present: "border-2 border-emerald-500 bg-emerald-50 text-emerald-800 shadow-sm shadow-emerald-100",
    late: "border-2 border-amber-500 bg-amber-50 text-amber-800 shadow-sm shadow-amber-100",
    absent: "border-2 border-rose-500 bg-rose-50 text-rose-800 shadow-sm shadow-rose-100",
    on_leave: "border-2 border-sky-500 bg-sky-50 text-sky-800 shadow-sm shadow-sky-100",
    weekend: "border border-dashed border-gray-300 bg-gray-50/50 text-gray-400",
    "today-unmarked": "border-2 border-indigo-500 bg-indigo-50 text-indigo-800 shadow-sm shadow-indigo-100 font-bold",
    future: "text-gray-300 border border-transparent",
    default: "text-gray-700 hover:bg-gray-100 border border-transparent"
  };

  // Helper for navigation
  const handlePrevMonth = () => {
    const prevMonth = monthInt === 1 ? 12 : monthInt - 1;
    const prevYear = monthInt === 1 ? yearInt - 1 : yearInt;
    setMonth(`${prevYear}-${String(prevMonth).padStart(2, "0")}`);
  };

  const handleNextMonth = () => {
    const nextMonth = monthInt === 12 ? 1 : monthInt + 1;
    const nextYear = monthInt === 12 ? yearInt + 1 : yearInt;
    setMonth(`${nextYear}-${String(nextMonth).padStart(2, "0")}`);
  };

  const handleGoToToday = () => {
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];
    setMonth(todayStr.slice(0, 7));
    setSelectedDate(todayStr);
  };

  // Calculate statistics for the current month
  let presentCount = 0;
  let lateCount = 0;
  let absentCount = 0;
  let leaveCount = 0;
  let totalWorkDays = 0;

  for (let i = 1; i <= daysInCurrentMonth; i++) {
    const dateStr = `${year}-${monthNum}-${String(i).padStart(2, "0")}`;
    const status = getDayStatus(dateStr);
    
    if (status === "present") presentCount++;
    else if (status === "late") lateCount++;
    else if (status === "absent") absentCount++;
    else if (status === "on_leave") leaveCount++;

    if (status !== "future" && status !== "weekend" && status !== "today-unmarked") {
      totalWorkDays++;
    }
  }

  const attendanceRate = totalWorkDays > 0 
    ? Math.round(((presentCount + lateCount) / totalWorkDays) * 100)
    : 100;

  // Selected Day Details variables
  const selectedDayStatus = getDayStatus(selectedDate);
  const selectedAttendance = attendanceMap[selectedDate];
  const selectedLeave = leaves.find((l) => {
    const start = l.fromDate;
    const end = l.toDate;
    return selectedDate >= start && selectedDate <= end;
  });

  // Helper to parse dates into readable formats
  const formatReadableDate = (dateStr) => {
    if (!dateStr) return "";
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateStr).toLocaleDateString("en-US", options);
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

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">View Attendance</h1>
          <p className="text-gray-500 text-sm mt-1">Track your daily presence, leaves, and time records</p>
        </div>
        
        {/* Navigation Controls */}
        <div className="flex items-center gap-3 bg-white p-1.5 rounded-xl border border-gray-200 shadow-sm self-start md:self-auto">
          <button
            onClick={handlePrevMonth}
            className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors"
            title="Previous Month"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <span className="font-semibold text-gray-800 px-3 min-w-[120px] text-center">
            {currentMonthName} {year}
          </span>
          
          <button
            onClick={handleNextMonth}
            className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors"
            title="Next Month"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          
          <div className="w-px h-6 bg-gray-200 mx-1" />
          
          <button
            onClick={handleGoToToday}
            className="px-3 py-1.5 hover:bg-indigo-50 text-indigo-600 hover:text-indigo-700 font-medium text-sm rounded-lg transition-colors"
          >
            Today
          </button>
        </div>
      </div>

      {/* Grid Layout (Stats & Calendar in one place) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left column: Stats summary and Calendar */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            
            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                <Percent className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Rate</p>
                <p className="text-2xl font-bold text-gray-900">{attendanceRate}%</p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                <UserCheck className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Present</p>
                <p className="text-2xl font-bold text-gray-900">{presentCount + lateCount}d</p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
                <XCircle className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Absent</p>
                <p className="text-2xl font-bold text-gray-900">{absentCount}d</p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-sky-50 text-sky-600 rounded-xl">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Leaves</p>
                <p className="text-2xl font-bold text-gray-900">{leaveCount}d</p>
              </div>
            </div>

          </div>

          {/* Calendar Card */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden p-6">
            
            {/* Weekdays Labels */}
            <div className="grid grid-cols-7 gap-2 mb-4 text-center">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, idx) => (
                <div 
                  key={day} 
                  className={`text-xs font-semibold uppercase tracking-wider ${
                    idx === 0 || idx === 6 ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-2">
              {cells.map((cell, idx) => {
                const isSelected = selectedDate === cell.dateStr;
                const status = cell.isCurrentMonth ? getDayStatus(cell.dateStr) : "other-month";
                
                // Construct day style classes
                let dayClass = "";
                if (!cell.isCurrentMonth) {
                  dayClass = "text-gray-300 cursor-pointer hover:text-gray-600 transition-colors";
                } else {
                  dayClass = statusStyles[status] || statusStyles.default;
                }

                return (
                  <div
                    key={`${cell.dateStr}-${idx}`}
                    onClick={() => {
                      if (!cell.isCurrentMonth) {
                        setMonth(cell.dateStr.slice(0, 7));
                        setSelectedDate(cell.dateStr);
                      } else {
                        setSelectedDate(cell.dateStr);
                      }
                    }}
                    className={`aspect-square flex flex-col items-center justify-center relative rounded-xl transition-all duration-200 select-none cursor-pointer ${
                      cell.isCurrentMonth ? "hover:scale-[1.03] active:scale-[0.97]" : ""
                    } ${
                      isSelected 
                        ? "ring-2 ring-indigo-600 ring-offset-2 scale-105 z-10 shadow-md" 
                        : ""
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${dayClass}`}>
                      {cell.day}
                    </div>

                    {/* Minimal indicator dots for current month active states */}
                    {cell.isCurrentMonth && (status === "present" || status === "late" || status === "on_leave") && (
                      <span className={`absolute bottom-1 w-1 h-1 rounded-full ${
                        status === "present" ? "bg-emerald-500" :
                        status === "late" ? "bg-amber-500" : "bg-sky-500"
                      }`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Legend */}
          <div className="bg-white px-6 py-4 rounded-2xl border border-gray-200 shadow-sm flex flex-wrap items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-emerald-50 border-2 border-emerald-500" />
              <span className="font-medium text-gray-600">Present</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-amber-50 border-2 border-amber-500" />
              <span className="font-medium text-gray-600">Late</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-rose-50 border-2 border-rose-500" />
              <span className="font-medium text-gray-600">Absent</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-sky-50 border-2 border-sky-500" />
              <span className="font-medium text-gray-600">On Leave</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-gray-50 border border-dashed border-gray-300" />
              <span className="font-medium text-gray-600">Weekend</span>
            </div>
          </div>

        </div>

        {/* Right column: Selected Date details panel */}
        <div className="lg:col-span-1">
          
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden sticky top-6">
            {/* Header */}
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center gap-3">
              <CalendarDays className="w-5 h-5 text-gray-500" />
              <span className="font-bold text-gray-800 text-base">Day Details</span>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              
              {/* Date Header */}
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Selected Date</p>
                <p className="text-lg font-bold text-gray-900 mt-0.5">{formatReadableDate(selectedDate)}</p>
              </div>

              {/* Status Badge */}
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Status</p>
                
                {selectedDayStatus === "present" && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Present (On Time)
                  </span>
                )}
                {selectedDayStatus === "late" && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    Late Check-in
                  </span>
                )}
                {selectedDayStatus === "absent" && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    Absent
                  </span>
                )}
                {selectedDayStatus === "on_leave" && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200">
                    <span className="w-2 h-2 rounded-full bg-sky-500" />
                    On Leave
                  </span>
                )}
                {selectedDayStatus === "weekend" && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-gray-50 text-gray-600 border border-gray-200">
                    <span className="w-2 h-2 rounded-full bg-gray-400" />
                    Weekly Off (Weekend)
                  </span>
                )}
                {selectedDayStatus === "today-unmarked" && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                    <span className="w-2 h-2 rounded-full bg-indigo-500" />
                    Pending Check-in
                  </span>
                )}
                {selectedDayStatus === "future" && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-gray-50 text-gray-400 border border-gray-200">
                    <span className="w-2 h-2 rounded-full bg-gray-300" />
                    Future Date
                  </span>
                )}
              </div>

              {/* Time stats if present / late */}
              {(selectedDayStatus === "present" || selectedDayStatus === "late") && selectedAttendance && (
                <div className="space-y-4 pt-4 border-t border-gray-100">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        Check In
                      </div>
                      <p className="text-sm font-semibold text-gray-800">
                        {selectedAttendance.checkInTime || "—"}
                      </p>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        <LogOut className="w-3.5 h-3.5 text-gray-400" />
                        Check Out
                      </div>
                      <p className="text-sm font-semibold text-gray-800">
                        {selectedAttendance.checkOutTime || "—"}
                      </p>
                    </div>
                  </div>

                  {selectedAttendance.checkInTime && selectedAttendance.checkOutTime && (
                    <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex justify-between items-center text-sm">
                      <span className="font-medium text-gray-500">Work Duration</span>
                      <span className="font-bold text-gray-800">
                        {calculateWorkDuration(selectedAttendance.checkInTime, selectedAttendance.checkOutTime) || "—"}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Location stats if present/late with location data */}
              {(selectedDayStatus === "present" || selectedDayStatus === "late") && selectedAttendance && (
                <div className="pt-4 border-t border-gray-100 space-y-3">
                  <div className="flex items-center gap-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    <MapPin className="w-3.5 h-3.5 text-gray-400" />
                    Punch Location
                  </div>

                  {selectedAttendance.location?.lat ? (
                    <div className="space-y-2">
                      <p className="text-xs text-gray-500 font-medium">
                        Accuracy: ±{Math.round(selectedAttendance.location.accuracy || 0)}m
                      </p>
                      
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${selectedAttendance.location.lat},${selectedAttendance.location.lng}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors hover:underline"
                      >
                        <MapIcon className="w-3.5 h-3.5" />
                        View on Google Maps
                      </a>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-xs text-gray-400 italic font-medium">
                      <MapPinOff className="w-3.5 h-3.5 text-gray-300" />
                      No location data captured
                    </div>
                  )}
                </div>
              )}

              {/* Leave details if on_leave */}
              {selectedDayStatus === "on_leave" && selectedLeave && (
                <div className="pt-4 border-t border-gray-100 space-y-4">
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Leave Period</p>
                    <p className="text-sm font-semibold text-gray-800 mt-1">
                      {selectedLeave.fromDate} to {selectedLeave.toDate}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Reason / Description</p>
                    <p className="text-sm text-gray-600 italic bg-gray-50 p-3 rounded-xl border border-gray-100 mt-1">
                      "{selectedLeave.reason || "No reason specified"}"
                    </p>
                  </div>
                </div>
              )}

              {/* Guide actions */}
              {selectedDayStatus === "today-unmarked" && (
                <div className="pt-4 border-t border-gray-100">
                  <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl space-y-3">
                    <p className="text-xs text-indigo-800 font-medium leading-relaxed">
                      You haven't checked in yet today. Head over to the Mark Attendance screen to check in.
                    </p>
                    <a
                      href="/employee/attendance/mark"
                      className="inline-flex items-center gap-1.5 w-full justify-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-colors shadow-sm"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      Punch In Now
                    </a>
                  </div>
                </div>
              )}

              {/* Weekend message */}
              {selectedDayStatus === "weekend" && (
                <div className="pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-400 italic text-center font-medium py-2">
                    Relax! It's a weekend weekly off.
                  </p>
                </div>
              )}

            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Attendance;
