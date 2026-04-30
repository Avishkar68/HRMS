import React, { useEffect, useState } from "react";
import api from "../../../utils/api";

const TeamAttendance = () => {
  const [todayData, setTodayData] = useState([]);
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [monthData, setMonthData] = useState([]);
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));

  const fetchToday = async () => {
    const res = await api.get("/manager/team-attendance/today");
    setTodayData(res.data);
  };

  useEffect(() => {
    fetchToday();
  }, []);

  const fetchEmployeeMonth = async (userId, selectedMonth = month) => {
    const res = await api.get(`/manager/employee-attendance/${userId}?month=${selectedMonth}`);
    setMonthData(res.data);
  };

  useEffect(() => {
    if (selectedEmp) fetchEmployeeMonth(selectedEmp.userId, month);
  }, [month]);

  const badgeColor = (status) => {
    if (status === "present") return "bg-emerald-100 text-emerald-800";
    if (status === "late") return "bg-amber-100 text-amber-800";
    if (status === "on_leave") return "bg-blue-100 text-blue-800";
    return "bg-gray-100 text-gray-700";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Team Attendance</h1>
        <p className="text-gray-500 text-sm mt-1">Today’s attendance and monthly view</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Today’s team</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-4 font-semibold text-gray-700">Employee</th>
                <th className="text-left p-4 font-semibold text-gray-700">Status</th>
                <th className="text-left p-4 font-semibold text-gray-700">Check In</th>
                <th className="text-left p-4 font-semibold text-gray-700">Check Out</th>
                <th className="text-left p-4 font-semibold text-gray-700">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {todayData.map((e) => (
                <tr key={e.userId} className="hover:bg-gray-50/50">
                  <td className="p-4 font-medium text-gray-900">{e.name}</td>
                  <td className="p-4">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${badgeColor(e.status)}`}>{e.status}</span>
                  </td>
                  <td className="p-4 text-gray-600">{e.checkInTime || "—"}</td>
                  <td className="p-4 text-gray-600">{e.checkOutTime || "—"}</td>
                  <td className="p-4">
                    <button onClick={() => { setSelectedEmp(e); fetchEmployeeMonth(e.userId); }} className="text-indigo-600 hover:underline text-xs font-medium">View month</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedEmp && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-20 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-gray-900">{selectedEmp.name} – Monthly attendance</h3>
              <button onClick={() => setSelectedEmp(null)} className="text-gray-500 hover:text-gray-700 text-xl leading-none">×</button>
            </div>
            <div className="p-4 border-b border-gray-100">
              <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
            <div className="flex-1 overflow-auto p-4">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-3 font-semibold text-gray-700">Date</th>
                    <th className="text-left p-3 font-semibold text-gray-700">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {monthData.map((d) => (
                    <tr key={d.date} className="hover:bg-gray-50/50">
                      <td className="p-3 font-medium text-gray-900">{d.date}</td>
                      <td className="p-3">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${badgeColor(d.status)}`}>{d.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamAttendance;
