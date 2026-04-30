import React, { useEffect, useState } from "react";
import api from "../../../utils/api";

const LeaveRequests = () => {
  const [leaves, setLeaves] = useState([]);
  const [status, setStatus] = useState("");

  const fetchLeaves = async () => {
    const url = status ? `/admin/leaves?status=${status}` : "/admin/leaves";
    const res = await api.get(url);
    setLeaves(res.data);
  };

  useEffect(() => {
    fetchLeaves();
  }, [status]);

  const badgeColor = (s) => {
    if (s === "approved") return "bg-emerald-100 text-emerald-800";
    if (s === "rejected") return "bg-red-100 text-red-800";
    return "bg-amber-100 text-amber-800";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leave Requests</h1>
          <p className="text-gray-500 text-sm mt-1">Overview of all leave applications</p>
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="">All</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {leaves.length === 0 ? (
          <div className="p-12 text-center text-gray-500">No leave records.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left p-4 font-semibold text-gray-700">Employee</th>
                  <th className="text-left p-4 font-semibold text-gray-700">Manager</th>
                  <th className="text-left p-4 font-semibold text-gray-700">From</th>
                  <th className="text-left p-4 font-semibold text-gray-700">To</th>
                  <th className="text-left p-4 font-semibold text-gray-700">Days</th>
                  <th className="text-left p-4 font-semibold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {leaves.map((l) => (
                  <tr key={l._id} className="hover:bg-gray-50/50">
                    <td className="p-4 font-medium text-gray-900">{l.employee?.name}</td>
                    <td className="p-4 text-gray-600">{l.manager?.name}</td>
                    <td className="p-4 text-gray-600">{l.fromDate}</td>
                    <td className="p-4 text-gray-600">{l.toDate}</td>
                    <td className="p-4 text-gray-600">{l.totalDays}</td>
                    <td className="p-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${badgeColor(l.status)}`}>{l.status}</span>
                    </td>
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

export default LeaveRequests;
