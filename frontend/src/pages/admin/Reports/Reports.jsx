import React, { useEffect, useState } from "react";
import api from "../../../utils/api";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from "recharts";

const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444"];

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

  if (loading) return <div className="p-4">Loading...</div>;
  if (!summary) return <div className="p-4 text-gray-500">Could not load reports.</div>;

  const leavePieData = Object.entries(summary.leaveStatusCounts || {}).map(([name, value]) => ({ name, value }));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">Reports</h2>
        <select
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          value={year}
          onChange={(e) => setYear(e.target.value)}
        >
          {[2024, 2025, 2026, 2027].map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl shadow border border-gray-100">
          <h3 className="font-semibold text-gray-600 text-sm uppercase tracking-wide">Total Users</h3>
          <p className="text-2xl font-bold text-gray-900 mt-1">{summary.userCount ?? 0}</p>
        </div>
        <div className="bg-white p-5 rounded-xl shadow border border-gray-100">
          <h3 className="font-semibold text-gray-600 text-sm uppercase tracking-wide">Leave (Pending)</h3>
          <p className="text-2xl font-bold text-amber-600 mt-1">{summary.leaveStatusCounts?.pending ?? 0}</p>
        </div>
        <div className="bg-white p-5 rounded-xl shadow border border-gray-100">
          <h3 className="font-semibold text-gray-600 text-sm uppercase tracking-wide">Leave (Approved)</h3>
          <p className="text-2xl font-bold text-green-600 mt-1">{summary.leaveStatusCounts?.approved ?? 0}</p>
        </div>
      </div>

      {summary.attendanceByMonth?.length > 0 && (
        <div className="bg-white p-6 rounded shadow">
          <h3 className="font-bold mb-4">Attendance by Month ({year})</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={summary.attendanceByMonth}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" name="Records" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {summary.leavesByMonth?.length > 0 && (
        <div className="bg-white p-6 rounded shadow">
          <h3 className="font-bold mb-4">Leaves by Month ({year})</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={summary.leavesByMonth}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#10b981" name="Requests" />
                <Bar dataKey="totalDays" fill="#f59e0b" name="Days" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {leavePieData.length > 0 && (
        <div className="bg-white p-6 rounded-xl shadow border border-gray-100 max-w-md">
          <h3 className="font-bold mb-4 text-gray-800">Leave Status (all time)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={leavePieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {leavePieData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {(summary.attendanceByMonth?.length === 0 && summary.leavesByMonth?.length === 0) && (
        <div className="bg-white p-6 rounded-xl shadow border border-gray-100">
          <p className="text-gray-500">No attendance or leave records for {year} yet. Summary above shows all-time leave status.</p>
        </div>
      )}
    </div>
  );
};

export default Reports;
