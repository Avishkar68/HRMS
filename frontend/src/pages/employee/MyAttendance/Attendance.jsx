import React, { useEffect, useState } from "react";
import api from "../../../utils/api";

const Attendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));

  const fetchHistory = async () => {
    const res = await api.get(`/attendance/history?month=${month}`);
    setAttendance(res.data.attendance || []);
    setLeaves(res.data.leaves || []);
  };

  useEffect(() => {
    fetchHistory();
  }, [month]);

  const [year, monthNum] = month.split("-");
  const daysInMonth = new Date(parseInt(year, 10), parseInt(monthNum, 10), 0).getDate();
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
  const getStatus = (date) => {
    if (leaveDates.has(date)) return "on_leave";
    if (attendanceMap[date]) return attendanceMap[date].status;
    return "absent";
  };
  const badgeColor = (status) => {
    if (status === "present") return "bg-emerald-100 text-emerald-800";
    if (status === "late") return "bg-amber-100 text-amber-800";
    if (status === "on_leave") return "bg-blue-100 text-blue-800";
    return "bg-gray-100 text-gray-700";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">View Attendance</h1>
          <p className="text-gray-500 text-sm mt-1">Monthly history</p>
        </div>
        <input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left p-3 font-semibold text-gray-700">Date</th>
                <th className="text-left p-3 font-semibold text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {Array.from({ length: daysInMonth }, (_, i) => {
                const day = String(i + 1).padStart(2, "0");
                const date = `${month}-${day}`;
                const s = getStatus(date);
                return (
                  <tr key={date} className="hover:bg-gray-50/50">
                    <td className="p-3 font-medium text-gray-900">{date}</td>
                    <td className="p-3">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${badgeColor(s)}`}>{s}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Attendance;
