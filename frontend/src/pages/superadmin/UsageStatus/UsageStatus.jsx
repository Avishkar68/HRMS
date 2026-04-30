import React, { useEffect, useState } from "react";
import api from "../../../utils/api";

const UsageStatus = () => {
  const [usage, setUsage] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsage = async () => {
      try {
        const res = await api.get("/superadmin/usage");
        setUsage(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsage();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Usage Status</h1>
        <p className="text-gray-500 text-sm mt-1">Per-company usage metrics</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {usage.length === 0 ? (
        <div className="p-12 text-center text-gray-500">No companies yet.</div>
      ) : (
        <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th className="border p-2 text-left">Company</th>
              <th className="border p-2 text-left">Plan</th>
              <th className="border p-2 text-left">Status</th>
              <th className="border p-2 text-right">Users</th>
              <th className="border p-2 text-right">Attendance Records</th>
              <th className="border p-2 text-right">Leave Requests</th>
            </tr>
          </thead>
          <tbody>
            {usage.map((u) => (
              <tr key={u.companyId}>
                <td className="border p-2 font-medium">{u.companyName}</td>
                <td className="border p-2">{u.plan}</td>
                <td className="border p-2">{u.status}</td>
                <td className="border p-2 text-right">{u.users ?? 0}</td>
                <td className="border p-2 text-right">{u.attendanceRecords ?? 0}</td>
                <td className="border p-2 text-right">{u.leaveRequests ?? 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      )}
      </div>
    </div>
  );
};

export default UsageStatus;
