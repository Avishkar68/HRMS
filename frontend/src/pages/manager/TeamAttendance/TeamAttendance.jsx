import React, { useEffect, useState } from "react";
import axios from "axios";

const TeamAttendance = () => {
  const [todayData, setTodayData] = useState([]);
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [monthData, setMonthData] = useState([]);
  const [month, setMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  /* ===== FETCH TODAY TEAM ATTENDANCE ===== */
  const fetchToday = async () => {
    const res = await axios.get(
      "http://localhost:3000/api/manager/team-attendance/today",
      { headers }
    );
    setTodayData(res.data);
  };

  useEffect(() => {
    fetchToday();
  }, []);

  /* ===== FETCH EMPLOYEE MONTH ===== */
  const fetchEmployeeMonth = async (userId, selectedMonth = month) => {
    const res = await axios.get(
      `http://localhost:3000/api/manager/employee-attendance/${userId}?month=${selectedMonth}`,
      { headers }
    );
    setMonthData(res.data);
  };

  /* 🔥 REFETCH WHEN MONTH CHANGES */
  useEffect(() => {
    if (selectedEmp) {
      fetchEmployeeMonth(selectedEmp.userId, month);
    }
  }, [month]);

  const badgeColor = (status) => {
    if (status === "present") return "bg-green-100 text-green-700";
    if (status === "late") return "bg-yellow-100 text-yellow-700";
    if (status === "on_leave") return "bg-blue-100 text-blue-700";
    return "bg-red-100 text-red-700";
  };

  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-xl font-bold mb-4">Today’s Team Attendance</h2>

      <table className="w-full border text-sm">
        <thead>
          <tr>
            <th className="border p-2">Employee</th>
            <th className="border p-2">Status</th>
            <th className="border p-2">Check In</th>
            <th className="border p-2">Check Out</th>
            <th className="border p-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {todayData.map((e) => (
            <tr key={e.userId} className="text-center">
              <td className="border p-2">{e.name}</td>
              <td className="border p-2">
                <span
                  className={`px-2 py-1 rounded text-xs ${badgeColor(e.status)}`}
                >
                  {e.status}
                </span>
              </td>
              <td className="border p-2">{e.checkInTime || "--"}</td>
              <td className="border p-2">{e.checkOutTime || "--"}</td>
              <td className="border p-2">
                <button
                  onClick={() => {
                    setSelectedEmp(e);
                    fetchEmployeeMonth(e.userId);
                  }}
                  className="text-blue-600 underline"
                >
                  View Month
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ===== MONTH MODAL ===== */}
      {selectedEmp && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded w-[600px] h-[600px] overflow-scroll">
            <div className="flex justify-between mb-3">
              <h3 className="font-bold">
                {selectedEmp.name} – Monthly Attendance
              </h3>
              <button onClick={() => setSelectedEmp(null)}>✕</button>
            </div>

            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="border p-1 mb-3"
            />

            <table className="w-full border text-sm">
              <thead>
                <tr>
                  <th className="border p-2">Date</th>
                  <th className="border p-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {monthData.map((d) => (
                  <tr key={d.date} className="text-center">
                    <td className="border p-2">{d.date}</td>
                    <td className="border p-2">
                      <span
                        className={`px-2 py-1 rounded text-xs ${badgeColor(d.status)}`}
                      >
                        {d.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

          </div>
        </div>
      )}
    </div>
  );
};

export default TeamAttendance;
