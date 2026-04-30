import React, { useEffect, useState } from "react";
import api from "../../../utils/api";

const ApproveLeaves = () => {
  const [leaves, setLeaves] = useState([]);

  const fetchLeaves = async () => {
    const res = await api.get("/manager/leaves");
    setLeaves(res.data);
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const updateStatus = async (id, status) => {
    await api.patch(`/manager/leaves/${id}`, { status });
    fetchLeaves();
  };

  const badgeColor = (s) => {
    if (s === "approved") return "bg-emerald-100 text-emerald-800";
    if (s === "rejected") return "bg-red-100 text-red-800";
    return "bg-amber-100 text-amber-800";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Approve Leaves</h1>
        <p className="text-gray-500 text-sm mt-1">Review and approve team leave requests</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {leaves.length === 0 ? (
          <div className="p-12 text-center text-gray-500">No leave requests.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left p-4 font-semibold text-gray-700">Employee</th>
                  <th className="text-left p-4 font-semibold text-gray-700">From</th>
                  <th className="text-left p-4 font-semibold text-gray-700">To</th>
                  <th className="text-left p-4 font-semibold text-gray-700">Days</th>
                  <th className="text-left p-4 font-semibold text-gray-700">Status</th>
                  <th className="text-left p-4 font-semibold text-gray-700">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {leaves.map((l) => (
                  <tr key={l._id} className="hover:bg-gray-50/50">
                    <td className="p-4 font-medium text-gray-900">{l.employee?.name}</td>
                    <td className="p-4 text-gray-600">{l.fromDate}</td>
                    <td className="p-4 text-gray-600">{l.toDate}</td>
                    <td className="p-4 text-gray-600">{l.totalDays}</td>
                    <td className="p-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${badgeColor(l.status)}`}>{l.status}</span>
                    </td>
                    <td className="p-4">
                      {l.status === "pending" ? (
                        <span className="flex flex-wrap gap-2">
                          <button onClick={() => updateStatus(l._id, "approved")} className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-medium hover:bg-emerald-700">Approve</button>
                          <button onClick={() => updateStatus(l._id, "rejected")} className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-medium hover:bg-red-700">Reject</button>
                        </span>
                      ) : (
                        "—"
                      )}
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

export default ApproveLeaves;
