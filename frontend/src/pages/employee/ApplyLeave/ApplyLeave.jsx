import React, { useEffect, useState } from "react";
import axios from "axios";

const ApplyLeave = () => {
  const [form, setForm] = useState({
    leaveTypeId: "",
    fromDate: "",
    toDate: "",
    reason: ""
  });

  const [leaves, setLeaves] = useState([]);
  const [balances, setBalances] = useState([]);

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  const fetchLeaves = async () => {
    const res = await axios.get(
      "http://localhost:3000/api/leave/my",
      { headers }
    );
    setLeaves(res.data);
  };

  const fetchBalances = async () => {
    const res = await axios.get(
      "http://localhost:3000/api/leave/balance",
      { headers }
    );
    setBalances(res.data);
  };

  useEffect(() => {
    fetchLeaves();
    fetchBalances();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      await axios.post(
        "http://localhost:3000/api/leave/apply",
        form,
        { headers }
      );

      alert("Leave applied");
      setForm({
        leaveTypeId: "",
        fromDate: "",
        toDate: "",
        reason: ""
      });

      fetchLeaves();
      fetchBalances();

    } catch (err) {
      alert(err.response?.data?.message || "Error");
    }
  };

  const badgeColor = (status) => {
    if (status === "approved") return "bg-green-100 text-green-700";
    if (status === "rejected") return "bg-red-100 text-red-700";
    return "bg-yellow-100 text-yellow-700";
  };

  return (
    <div className="space-y-6">

      {/* ===== LEAVE BALANCE ===== */}
      <div className="grid grid-cols-2 gap-4 max-w-xl">
        {balances.map((b) => (
          <div key={b.leaveTypeId} className="bg-white p-4 rounded shadow">
            <h3 className="font-semibold">{b.leaveType}</h3>
            <p className="text-sm text-gray-600">
              Remaining: <b>{b.remaining}</b> days
            </p>
          </div>
        ))}
      </div>

      {/* ===== APPLY FORM ===== */}
      <div className="bg-white p-6 rounded shadow w-96">
        <h2 className="font-bold mb-4">Apply Leave</h2>

        <select
          name="leaveTypeId"
          className="w-full border p-2 mb-2"
          value={form.leaveTypeId}
          onChange={handleChange}
        >
          <option value="">Select Leave Type</option>
          {balances.map((b) => (
            <option key={b.leaveTypeId} value={b.leaveTypeId}>
              {b.leaveType}
            </option>
          ))}
        </select>

        <input
          type="date"
          name="fromDate"
          className="w-full border p-2 mb-2"
          value={form.fromDate}
          onChange={handleChange}
        />

        <input
          type="date"
          name="toDate"
          className="w-full border p-2 mb-2"
          value={form.toDate}
          onChange={handleChange}
        />

        <textarea
          name="reason"
          placeholder="Reason"
          className="w-full border p-2 mb-4"
          value={form.reason}
          onChange={handleChange}
        />

        <button
          onClick={handleSubmit}
          className="bg-black text-white px-4 py-2 w-full"
          disabled={!form.leaveTypeId}
        >
          Submit Leave
        </button>
      </div>

      {/* ===== MY LEAVES ===== */}
      <div className="bg-white p-6 rounded shadow">
        <h2 className="font-bold mb-4">My Leave Requests</h2>

        {leaves.length === 0 ? (
          <p className="text-gray-500 text-sm">No leave requests yet</p>
        ) : (
          <table className="w-full border text-sm">
            <thead>
              <tr>
                <th className="border p-2">From</th>
                <th className="border p-2">To</th>
                <th className="border p-2">Days</th>
                <th className="border p-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {leaves.map((l) => (
                <tr key={l._id} className="text-center">
                  <td className="border p-2">{l.fromDate}</td>
                  <td className="border p-2">{l.toDate}</td>
                  <td className="border p-2">{l.totalDays}</td>
                  <td className="border p-2">
                    <span className={`px-2 py-1 rounded text-xs ${badgeColor(l.status)}`}>
                      {l.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

    </div>
  );
};

export default ApplyLeave;
