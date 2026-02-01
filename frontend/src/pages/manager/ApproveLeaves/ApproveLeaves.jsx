import React, { useEffect, useState } from "react";
import axios from "axios";

const ApproveLeaves = () => {
  const [leaves, setLeaves] = useState([]);
  const token = localStorage.getItem("token");

  const headers = {
    Authorization: `Bearer ${token}`
  };

  const fetchLeaves = async () => {
    const res = await axios.get(
      "http://localhost:3000/api/manager/leaves",
      { headers }
    );
    setLeaves(res.data);
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const updateStatus = async (id, status) => {
    await axios.patch(
      `http://localhost:3000/api/manager/leaves/${id}`,
      { status },
      { headers }
    );
    fetchLeaves();
  };

  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-xl font-bold mb-4">Leave Requests</h2>

      {leaves.length === 0 ? (
        <p className="text-gray-500">No leave requests</p>
      ) : (
        <table className="w-full border text-sm">
          <thead>
            <tr>
              <th className="border p-2">Employee</th>
              <th className="border p-2">From</th>
              <th className="border p-2">To</th>
              <th className="border p-2">Days</th>
              <th className="border p-2">Status</th>
              <th className="border p-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {leaves.map((l) => (
              <tr key={l._id} className="text-center">
                <td className="border p-2">{l.employee?.name}</td>
                <td className="border p-2">{l.fromDate}</td>
                <td className="border p-2">{l.toDate}</td>
                <td className="border p-2">{l.totalDays}</td>
                <td className="border p-2">{l.status}</td>
                <td className="border p-2">
                  {l.status === "pending" ? (
                    <div className="flex gap-2 justify-center">
                      <button
                        onClick={() => updateStatus(l._id, "approved")}
                        className="bg-green-600 text-white px-2 py-1 text-xs"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => updateStatus(l._id, "rejected")}
                        className="bg-red-600 text-white px-2 py-1 text-xs"
                      >
                        Reject
                      </button>
                    </div>
                  ) : (
                    "--"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ApproveLeaves;
