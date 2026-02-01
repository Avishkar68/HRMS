import React, { useEffect, useState } from "react";
import axios from "axios";

const LeaveRequests = () => {
  const [leaves, setLeaves] = useState([]);
  const [status, setStatus] = useState("");

  const token = localStorage.getItem("token");

  const headers = {
    Authorization: `Bearer ${token}`
  };

  const fetchLeaves = async () => {
    const url = status
      ? `http://localhost:3000/api/admin/leaves?status=${status}`
      : "http://localhost:3000/api/admin/leaves";

    const res = await axios.get(url, { headers });
    setLeaves(res.data);
  };

  useEffect(() => {
    fetchLeaves();
  }, [status]);

  const badgeColor = (s) => {
    if (s === "approved") return "bg-green-100 text-green-700";
    if (s === "rejected") return "bg-red-100 text-red-700";
    return "bg-yellow-100 text-yellow-700";
  };

  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-xl font-bold mb-4">Leave Overview</h2>

      {/* FILTER */}
      <select
        className="border p-2 mb-4"
        value={status}
        onChange={(e) => setStatus(e.target.value)}
      >
        <option value="">All</option>
        <option value="pending">Pending</option>
        <option value="approved">Approved</option>
        <option value="rejected">Rejected</option>
      </select>

      <table className="w-full border text-sm">
        <thead>
          <tr>
            <th className="border p-2">Employee</th>
            <th className="border p-2">Manager</th>
            <th className="border p-2">From</th>
            <th className="border p-2">To</th>
            <th className="border p-2">Days</th>
            <th className="border p-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {leaves.map(l => (
            <tr key={l._id} className="text-center">
              <td className="border p-2">{l.employee?.name}</td>
              <td className="border p-2">{l.manager?.name}</td>
              <td className="border p-2">{l.fromDate}</td>
              <td className="border p-2">{l.toDate}</td>
              <td className="border p-2">{l.totalDays}</td>
              <td className="border p-2">
                <span
                  className={`px-2 py-1 rounded text-xs ${badgeColor(l.status)}`}
                >
                  {l.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {leaves.length === 0 && (
        <p className="text-gray-500 mt-4">No leave records</p>
      )}
    </div>
  );
};

export default LeaveRequests;
