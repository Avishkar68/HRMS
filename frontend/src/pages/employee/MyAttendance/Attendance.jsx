import React, { useEffect, useState } from "react";
import axios from "axios";

const Attendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [month, setMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  const fetchHistory = async () => {
    const res = await axios.get(
      `http://localhost:3000/api/attendance/history?month=${month}`,
      { headers }
    );
    setAttendance(res.data.attendance || []);
    setLeaves(res.data.leaves || []);
  };

  useEffect(() => {
    fetchHistory();
  }, [month]);

  /* ===== DAYS IN MONTH ===== */
  const [year, monthNum] = month.split("-");
  const daysInMonth = new Date(year, monthNum, 0).getDate();

  /* ===== MAP ATTENDANCE ===== */
  const attendanceMap = {};
  attendance.forEach(a => {
    attendanceMap[a.date] = a;
  });

  /* ===== MAP LEAVES ===== */
  const leaveDates = new Set();

  leaves.forEach(l => {
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
    if (status === "present") return "bg-green-100 text-green-700";
    if (status === "late") return "bg-yellow-100 text-yellow-700";
    if (status === "on_leave") return "bg-blue-100 text-blue-700";
    return "bg-red-100 text-red-700";
  };

  return (
    <div className="bg-white p-6 rounded shadow">
      <div className="flex justify-between mb-4">
        <h2 className="font-bold">Monthly Attendance</h2>
        <input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="border p-1"
        />
      </div>

      <table className="w-full border text-sm">
        <thead>
          <tr>
            <th className="border p-2">Date</th>
            <th className="border p-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: daysInMonth }, (_, i) => {
            const day = String(i + 1).padStart(2, "0");
            const date = `${month}-${day}`;
            const s = getStatus(date);

            return (
              <tr key={date} className="text-center">
                <td className="border p-2">{date}</td>
                <td className="border p-2">
                  <span
                    className={`px-2 py-1 rounded text-xs ${badgeColor(s)}`}
                  >
                    {s}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default Attendance;
