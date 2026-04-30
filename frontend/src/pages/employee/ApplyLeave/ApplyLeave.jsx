import React, { useEffect, useState } from "react";
import api from "../../../utils/api";

const ApplyLeave = () => {
  const [form, setForm] = useState({ leaveTypeId: "", fromDate: "", toDate: "", reason: "" });
  const [leaves, setLeaves] = useState([]);
  const [balances, setBalances] = useState([]);

  const fetchLeaves = async () => {
    const res = await api.get("/leave/my");
    setLeaves(res.data);
  };
  const fetchBalances = async () => {
    const res = await api.get("/leave/balance");
    setBalances(res.data);
  };

  useEffect(() => {
    fetchLeaves();
    fetchBalances();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    try {
      await api.post("/leave/apply", form);
      alert("Leave applied");
      setForm({ leaveTypeId: "", fromDate: "", toDate: "", reason: "" });
      fetchLeaves();
      fetchBalances();
    } catch (err) {
      alert(err.response?.data?.message || "Error");
    }
  };

  const badgeColor = (status) => {
    if (status === "approved") return "bg-emerald-100 text-emerald-800";
    if (status === "rejected") return "bg-red-100 text-red-800";
    return "bg-amber-100 text-amber-800";
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Apply Leave</h1>
        <p className="text-gray-500 text-sm mt-1">Submit a leave request</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {balances.map((b) => (
          <div key={b.leaveTypeId} className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
            <h3 className="font-semibold text-gray-900">{b.leaveType}</h3>
            <p className="text-sm text-gray-500 mt-1">Remaining: <strong className="text-gray-900">{b.remaining}</strong> days</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden max-w-lg">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">New leave request</h2>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Leave type</label>
            <select name="leaveTypeId" value={form.leaveTypeId} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" required>
              <option value="">Select leave type</option>
              {balances.map((b) => (
                <option key={b.leaveTypeId} value={b.leaveTypeId}>{b.leaveType}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
              <input type="date" name="fromDate" value={form.fromDate} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
              <input type="date" name="toDate" value={form.toDate} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reason (optional)</label>
            <textarea name="reason" value={form.reason} onChange={handleChange} placeholder="Reason" rows={3} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
          </div>
          <button onClick={handleSubmit} disabled={!form.leaveTypeId || !form.fromDate || !form.toDate} className="w-full py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed">
            Submit leave
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">My leave requests</h2>
        </div>
        {leaves.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No leave requests yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left p-3 font-semibold text-gray-700">From</th>
                  <th className="text-left p-3 font-semibold text-gray-700">To</th>
                  <th className="text-left p-3 font-semibold text-gray-700">Days</th>
                  <th className="text-left p-3 font-semibold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {leaves.map((l) => (
                  <tr key={l._id} className="hover:bg-gray-50/50">
                    <td className="p-3 font-medium text-gray-900">{l.fromDate}</td>
                    <td className="p-3 text-gray-600">{l.toDate}</td>
                    <td className="p-3 text-gray-600">{l.totalDays}</td>
                    <td className="p-3">
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

export default ApplyLeave;
