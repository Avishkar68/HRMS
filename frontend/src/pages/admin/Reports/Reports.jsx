import React, { useEffect, useState } from "react";
import api from "../../../utils/api";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Legend, 
  PieChart, 
  Pie, 
  Cell,
  CartesianGrid
} from "recharts";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  CalendarClock, 
  CheckCircle2, 
  Calendar,
  AlertCircle,
  FileBarChart
} from "lucide-react";

const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

const Reports = () => {
  const [summary, setSummary] = useState(null);
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/admin/reports/summary?year=${year}`);
        setSummary(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, [year]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="p-8 text-center text-gray-500 bg-white rounded-3xl border border-gray-200 shadow-sm flex flex-col items-center justify-center gap-2">
        <AlertCircle className="w-8 h-8 text-gray-300" />
        <p className="font-semibold text-gray-800 text-sm">Could not load reports</p>
      </div>
    );
  }

  const leavePieData = Object.entries(summary.leaveStatusCounts || {})
    .filter(([_, val]) => val > 0)
    .map(([name, value]) => ({ name, value }));

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-950 tracking-tight">Reports &amp; Analytics</h1>
          <p className="text-gray-500 text-sm mt-1">Visualize monthly workspace attendance logs and leave usage stats</p>
        </div>
        <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-gray-200 shadow-sm">
          <Calendar className="w-4 h-4 text-indigo-600 ml-2" />
          <select
            className="border-0 bg-transparent text-sm font-bold text-gray-800 focus:ring-0 cursor-pointer pr-8"
            value={year}
            onChange={(e) => setYear(e.target.value)}
          >
            {[2024, 2025, 2026, 2027].map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Aggregate metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-gray-205 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Total Accounts</span>
            <p className="text-3xl font-black text-gray-955 font-mono">{summary.userCount ?? 0}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-650">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-205 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Leave (Pending)</span>
            <p className="text-3xl font-black text-amber-600 font-mono">{summary.leaveStatusCounts?.pending ?? 0}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-650">
            <CalendarClock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-205 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Leave (Approved)</span>
            <p className="text-3xl font-black text-emerald-600 font-mono">{summary.leaveStatusCounts?.approved ?? 0}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-650">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Grid of chart graphics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Attendance by Month chart */}
        {summary.attendanceByMonth?.length > 0 && (
          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-4">
            <div>
              <h3 className="font-extrabold text-gray-950 text-base">Attendance logs by Month ({year})</h3>
              <p className="text-gray-400 text-xs mt-0.5">Sum of daily check-in activity</p>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={summary.attendanceByMonth} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} fontStyle="bold" />
                  <YAxis stroke="#94a3b8" fontSize={11} fontStyle="bold" />
                  <Tooltip cursor={{ fill: "#f8fafc" }} contentStyle={{ borderRadius: "1rem", border: "1px solid #e2e8f0" }} />
                  <Bar dataKey="count" fill="url(#attendanceGrad)" radius={[4, 4, 0, 0]} name="Check-in records" />
                  <defs>
                    <linearGradient id="attendanceGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#4f46e5" stopOpacity={0.9} />
                      <stop offset="100%" stopColor="#6366f1" stopOpacity={0.3} />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Leaves by Month chart */}
        {summary.leavesByMonth?.length > 0 && (
          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-4">
            <div>
              <h3 className="font-extrabold text-gray-950 text-base">Leaves requested by Month ({year})</h3>
              <p className="text-gray-400 text-xs mt-0.5">Requested versus total calendar days off</p>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={summary.leavesByMonth} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} fontStyle="bold" />
                  <YAxis stroke="#94a3b8" fontSize={11} fontStyle="bold" />
                  <Tooltip contentStyle={{ borderRadius: "1rem", border: "1px solid #e2e8f0" }} />
                  <Legend verticalAlign="top" height={36} iconType="circle" />
                  <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} name="Requests" />
                  <Bar dataKey="totalDays" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Days" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Leave Pie data */}
        {leavePieData.length > 0 && (
          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-4 max-w-xl">
            <div>
              <h3 className="font-extrabold text-gray-955 text-base">Leave Applications Share</h3>
              <p className="text-gray-400 text-xs mt-0.5">All-time share based on status values</p>
            </div>
            <div className="h-72 flex flex-col justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={leavePieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    innerRadius={45}
                    paddingAngle={3}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {leavePieData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="rgba(255,255,255,0.3)" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: "1rem", border: "1px solid #e2e8f0" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Empty placeholder if no records exist for the chosen year */}
        {(summary.attendanceByMonth?.length === 0 && summary.leavesByMonth?.length === 0) && (
          <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm flex flex-col items-center justify-center gap-2 lg:col-span-2 text-center text-gray-450">
            <FileBarChart className="w-10 h-10 text-gray-300" />
            <p className="font-bold text-gray-800 text-sm">No analytics records for {year}</p>
            <p className="text-xs">Select another year or check back once data gets registered.</p>
          </div>
        )}

      </div>
    </div>
  );
};

export default Reports;
