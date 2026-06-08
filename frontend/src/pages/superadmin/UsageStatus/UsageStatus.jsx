import React, { useEffect, useState } from "react";
import api from "../../../utils/api";
import { 
  BarChart3, 
  Users, 
  CalendarCheck, 
  CalendarClock, 
  AlertCircle,
  TrendingUp,
  Activity,
  ServerCrash
} from "lucide-react";

const UsageStatus = () => {
  const [usage, setUsage] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsage = async () => {
      try {
        const res = await api.get("/superadmin/usage");
        setUsage(res.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsage();
  }, []);

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  // Calculate global totals
  const totalUsers = usage.reduce((sum, u) => sum + (u.users || 0), 0);
  const totalAttendance = usage.reduce((sum, u) => sum + (u.attendanceRecords || 0), 0);
  const totalLeaves = usage.reduce((sum, u) => sum + (u.leaveRequests || 0), 0);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-955 tracking-tight">Usage Telemetry</h1>
          <p className="text-gray-500 text-sm mt-1">Audit active user load, check-in databases, and leave archives per enterprise instance</p>
        </div>
      </div>

      {/* Aggregate System Load */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-gray-205 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider font-mono">Global User Registrations</span>
            <p className="text-3xl font-black text-indigo-650 font-mono">{totalUsers}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-650">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-205 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider font-mono">Global Attendance Records</span>
            <p className="text-3xl font-black text-emerald-600 font-mono">{totalAttendance}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-650">
            <CalendarCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-205 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider font-mono">Global Leave Requests</span>
            <p className="text-3xl font-black text-amber-600 font-mono">{totalLeaves}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-650">
            <CalendarClock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Database Listing Card */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
        {usage.length === 0 ? (
          <div className="p-16 text-center text-gray-400 flex flex-col items-center justify-center gap-2">
            <AlertCircle className="w-8 h-8 text-gray-300" />
            <p className="font-semibold text-gray-800 text-sm">No telemetry records found</p>
            <p className="text-xs">Once enterprise domains register active accounts, their database metrics will log here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left p-4 font-semibold text-gray-600">Enterprise Tenant</th>
                  <th className="text-left p-4 font-semibold text-gray-600">Plan &amp; status</th>
                  <th className="text-right p-4 font-semibold text-gray-600">Users Registered</th>
                  <th className="text-right p-4 font-semibold text-gray-600">Attendance Logs</th>
                  <th className="text-right p-4 font-semibold text-gray-600">Leave Applications</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {usage.map((u) => {
                  const initials = getInitials(u.companyName || "C");
                  const plan = u.plan || "basic";
                  const status = u.status || "active";
                  return (
                    <tr key={u.companyId} className="hover:bg-indigo-50/10 transition-colors">
                      <td className="p-4 font-medium text-gray-900 flex items-center gap-3">
                        <div className="w-9 h-9 bg-indigo-50 text-indigo-700 font-extrabold rounded-xl flex items-center justify-center text-xs shadow-inner">
                          {initials}
                        </div>
                        <div>
                          <p className="font-bold text-gray-955">{u.companyName}</p>
                          <p className="text-[10px] text-gray-400 font-mono">Tenant ID: {u.companyId}</p>
                        </div>
                      </td>
                      <td className="p-4 space-x-2">
                        <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-extrabold uppercase font-mono border ${
                          plan === "premium" 
                            ? "bg-amber-50 text-amber-700 border-amber-150" 
                            : "bg-gray-50 text-gray-600 border-gray-200"
                        }`}>
                          {plan}
                        </span>
                        <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-extrabold uppercase font-mono border ${
                          status === "active"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-150"
                            : "bg-rose-50 text-rose-700 border-rose-150"
                        }`}>
                          {status}
                        </span>
                      </td>
                      <td className="p-4 text-right font-bold text-gray-900 font-mono">{u.users ?? 0}</td>
                      <td className="p-4 text-right font-bold text-gray-900 font-mono">{u.attendanceRecords ?? 0}</td>
                      <td className="p-4 text-right font-bold text-gray-900 font-mono">{u.leaveRequests ?? 0}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default UsageStatus;
