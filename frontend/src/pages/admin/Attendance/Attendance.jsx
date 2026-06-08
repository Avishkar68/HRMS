import React, { useEffect, useState } from "react";
import api from "../../../utils/api";
import { 
  Calendar, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  UserCheck, 
  Users, 
  UserMinus,
  Search,
  MapPin,
  Coffee
} from "lucide-react";

const Attendance = () => {
  const [data, setData] = useState([]);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/attendance/grouped${date ? `?date=${date}` : ""}`);
      setData(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [date]);

  const statusBadge = (s) => {
    const status = (s || "").toLowerCase();
    if (status === "present") return "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (status === "on_leave") return "bg-blue-50 text-blue-700 border-blue-200";
    if (status === "late") return "bg-amber-50 text-amber-700 border-amber-200";
    return "bg-rose-50 text-rose-700 border-rose-200";
  };

  const getInitials = (name) => {
    if (!name) return "??";
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  // Compute stats across all manager teams
  let totalStaff = 0;
  let presentCount = 0;
  let onLeaveCount = 0;
  let absentCount = 0;

  data.forEach((manager) => {
    if (manager.team) {
      manager.team.forEach((emp) => {
        totalStaff++;
        const status = (emp.status || "").toLowerCase();
        if (status === "present") presentCount++;
        else if (status === "on_leave") onLeaveCount++;
        else absentCount++;
      });
    }
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Daily Attendance</h1>
          <p className="text-gray-500 text-sm mt-1">Monitor workspace check-in and check-out logs grouped by manager</p>
        </div>
        <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-gray-200 shadow-sm">
          <Calendar className="w-4 h-4 text-indigo-600 ml-2" />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border-0 bg-transparent text-sm font-bold text-gray-800 focus:ring-0 cursor-pointer pr-2"
          />
        </div>
      </div>

      {/* Aggregate Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Total Scheduled</span>
          <span className="text-2xl font-black text-gray-955 mt-2 font-mono">{totalStaff}</span>
        </div>
        <div className="bg-emerald-50/20 p-4 rounded-2xl border border-emerald-100 shadow-sm flex flex-col justify-between">
          <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">Present Today</span>
          <span className="text-2xl font-black text-emerald-700 mt-2 font-mono">{presentCount}</span>
        </div>
        <div className="bg-blue-50/20 p-4 rounded-2xl border border-blue-100 shadow-sm flex flex-col justify-between">
          <span className="text-[10px] text-blue-600 font-bold uppercase tracking-wider">Approved Leave</span>
          <span className="text-2xl font-black text-blue-700 mt-2 font-mono">{onLeaveCount}</span>
        </div>
        <div className="bg-rose-50/20 p-4 rounded-2xl border border-rose-100 shadow-sm flex flex-col justify-between">
          <span className="text-[10px] text-rose-600 font-bold uppercase tracking-wider">Absent / Unreported</span>
          <span className="text-2xl font-black text-rose-700 mt-2 font-mono">{absentCount}</span>
        </div>
      </div>

      {/* Roster database listings */}
      <div className="space-y-6">
        {loading ? (
          <div className="p-16 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-600 border-t-transparent mx-auto" />
          </div>
        ) : data.length === 0 ? (
          <div className="p-16 text-center text-gray-400 bg-white rounded-3xl border border-gray-200 shadow-sm flex flex-col items-center justify-center gap-2">
            <AlertCircle className="w-8 h-8 text-gray-300" />
            <p className="font-semibold text-gray-800 text-sm">No attendance records found</p>
            <p className="text-xs text-gray-400">There are no check-ins logged for {date}.</p>
          </div>
        ) : (
          data.map((manager) => (
            <div key={manager.managerId} className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
              {/* Manager info Header */}
              <div className="px-6 py-4.5 bg-gradient-to-r from-slate-50 to-white border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-slate-900 text-white font-extrabold text-xs flex items-center justify-center shadow-inner">
                    {getInitials(manager.managerName)}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-gray-900 text-sm">{manager.managerName}</h3>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Reporting Manager</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-bold font-mono">
                  {manager.team?.length || 0} Member{manager.team?.length !== 1 ? "s" : ""}
                </span>
              </div>

              {/* Roster Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="text-left p-4 font-semibold text-gray-600">Employee</th>
                      <th className="text-center p-4 font-semibold text-gray-600">Check-in Status</th>
                      <th className="text-center p-4 font-semibold text-gray-600">Check In Time</th>
                      <th className="text-center p-4 font-semibold text-gray-600">Check Out Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {manager.team?.map((emp) => (
                      <tr key={emp.userId} className="hover:bg-indigo-50/10 transition-colors">
                        <td className="p-4 font-medium text-gray-900 flex items-center gap-3">
                          <div className="w-9 h-9 bg-indigo-50 text-indigo-700 font-extrabold rounded-xl flex items-center justify-center text-xs shadow-inner">
                            {getInitials(emp.name)}
                          </div>
                          <div>
                            <p className="font-bold text-gray-950">{emp.name}</p>
                            <p className="text-[10px] text-gray-400 font-mono">{emp.userId}</p>
                          </div>
                        </td>
                        <td className="p-4 text-center">
                          <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold border capitalize ${statusBadge(emp.status)}`}>
                            {emp.status}
                          </span>
                        </td>
                        <td className="p-4 text-center text-gray-600 font-mono font-medium">{emp.checkInTime || "—"}</td>
                        <td className="p-4 text-center text-gray-600 font-mono font-medium">{emp.checkOutTime || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Attendance;
