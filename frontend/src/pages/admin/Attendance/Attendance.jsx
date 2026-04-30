import React, { useEffect, useState } from "react";
import api from "../../../utils/api";

const Attendance = () => {
  const [data, setData] = useState([]);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/attendance/grouped${date ? `?date=${date}` : ""}`);
      setData(res.data);
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
    if (s === "present") return "bg-emerald-100 text-emerald-800";
    if (s === "on_leave") return "bg-blue-100 text-blue-800";
    return "bg-gray-100 text-gray-700";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Attendance</h1>
          <p className="text-gray-500 text-sm mt-1">Grouped by manager</p>
        </div>
        <label className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Date</span>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </label>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center min-h-[120px]">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-600 border-t-transparent" />
          </div>
        ) : data.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center text-gray-500">
            No attendance data for this date.
          </div>
        ) : (
          data.map((manager) => (
            <div key={manager.managerId} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 font-semibold text-gray-800">
                Manager: {manager.managerName}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left p-3 font-semibold text-gray-700">Employee</th>
                      <th className="text-left p-3 font-semibold text-gray-700">Status</th>
                      <th className="text-left p-3 font-semibold text-gray-700">Check In</th>
                      <th className="text-left p-3 font-semibold text-gray-700">Check Out</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {manager.team.map((emp) => (
                      <tr key={emp.userId} className="hover:bg-gray-50/50">
                        <td className="p-3 font-medium text-gray-900">{emp.name}</td>
                        <td className="p-3">
                          <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${statusBadge(emp.status)}`}>
                            {emp.status}
                          </span>
                        </td>
                        <td className="p-3 text-gray-600">{emp.checkInTime || "—"}</td>
                        <td className="p-3 text-gray-600">{emp.checkOutTime || "—"}</td>
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
