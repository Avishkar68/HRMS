import React, { useEffect, useState } from "react";
import api from "../../../utils/api";
import { 
  Calendar, 
  CalendarDays, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Clock, 
  Compass, 
  Stethoscope, 
  Plane, 
  FileText,
  ChevronRight,
  Info
} from "lucide-react";

const ApplyLeave = () => {
  const [form, setForm] = useState({ leaveTypeId: "", fromDate: "", toDate: "", reason: "" });
  const [leaves, setLeaves] = useState([]);
  const [balances, setBalances] = useState([]);
  const [daysRequested, setDaysRequested] = useState(0);
  const [balanceWarning, setBalanceWarning] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

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

  // Calculate requested days in real time
  useEffect(() => {
    if (form.fromDate && form.toDate) {
      const from = new Date(form.fromDate);
      const to = new Date(form.toDate);
      const diffTime = to - from;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      
      if (diffDays > 0) {
        setDaysRequested(diffDays);
        
        // Check if requested days exceed remaining balance
        const selectedBalance = balances.find(b => b.leaveTypeId === form.leaveTypeId);
        if (selectedBalance && diffDays > selectedBalance.remaining) {
          setBalanceWarning(true);
        } else {
          setBalanceWarning(false);
        }
      } else {
        setDaysRequested(0);
        setBalanceWarning(false);
      }
    } else {
      setDaysRequested(0);
      setBalanceWarning(false);
    }
  }, [form.fromDate, form.toDate, form.leaveTypeId, balances]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (balanceWarning) {
      alert("You have insufficient balance for this leave request.");
      return;
    }

    setSubmitLoading(true);
    try {
      await api.post("/leave/apply", form);
      setForm({ leaveTypeId: "", fromDate: "", toDate: "", reason: "" });
      setDaysRequested(0);
      setBalanceWarning(false);
      await fetchLeaves();
      await fetchBalances();
      alert("Leave request submitted successfully!");
    } catch (err) {
      alert(err.response?.data?.message || "Error submitting leave request");
    } finally {
      setSubmitLoading(false);
    }
  };

  const badgeColor = (status) => {
    if (status === "approved") return "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (status === "rejected") return "bg-rose-50 text-rose-700 border-rose-200";
    return "bg-amber-50 text-amber-700 border-amber-200";
  };

  const getLeaveIcon = (typeName) => {
    const name = (typeName || "").toLowerCase();
    if (name.includes("sick") || name.includes("medical")) return <Stethoscope className="w-5 h-5 text-emerald-500" />;
    if (name.includes("casual")) return <Compass className="w-5 h-5 text-amber-500" />;
    if (name.includes("annual") || name.includes("earned") || name.includes("vacation")) return <Plane className="w-5 h-5 text-indigo-500" />;
    return <Calendar className="w-5 h-5 text-sky-500" />;
  };

  const getBalanceColorTheme = (typeName) => {
    const name = (typeName || "").toLowerCase();
    if (name.includes("sick") || name.includes("medical")) return {
      card: "border-emerald-100 bg-emerald-50/20",
      bar: "bg-emerald-500",
      text: "text-emerald-700"
    };
    if (name.includes("casual")) return {
      card: "border-amber-100 bg-amber-50/20",
      bar: "bg-amber-500",
      text: "text-amber-700"
    };
    if (name.includes("annual") || name.includes("earned") || name.includes("vacation")) return {
      card: "border-indigo-100 bg-indigo-50/20",
      bar: "bg-indigo-500",
      text: "text-indigo-700"
    };
    return {
      card: "border-sky-100 bg-sky-50/20",
      bar: "bg-sky-500",
      text: "text-sky-700"
    };
  };

  // Map to get leave name by ID
  const typeMap = {};
  balances.forEach((b) => {
    typeMap[b.leaveTypeId] = b.leaveType;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Apply Leave</h1>
        <p className="text-gray-500 text-sm mt-1">Submit, monitor, and manage your vacation and medical leave requests</p>
      </div>

      {/* Leave Balances Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {balances.map((b) => {
          const theme = getBalanceColorTheme(b.leaveType);
          const usedPercentage = b.total > 0 ? (b.used / b.total) * 100 : 0;
          return (
            <div key={b.leaveTypeId} className={`bg-white rounded-2xl border p-5 shadow-sm transition-all hover:shadow-md flex flex-col justify-between ${theme.card}`}>
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <h3 className="font-bold text-gray-900 text-base">{b.leaveType}</h3>
                  <p className="text-xs text-gray-400 font-semibold">Leave Balance Year {new Date().getFullYear()}</p>
                </div>
                <div className="p-2.5 bg-white rounded-xl shadow-inner border border-gray-100">
                  {getLeaveIcon(b.leaveType)}
                </div>
              </div>

              <div className="mt-6 space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-gray-500">Remaining</span>
                  <span className={theme.text}>{b.remaining} / {b.total} Days</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className={`h-2 rounded-full ${theme.bar} transition-all duration-500`} style={{ width: `${Math.min(usedPercentage, 100)}%` }} />
                </div>
                <div className="flex justify-between text-[10px] text-gray-400 font-semibold">
                  <span>{b.used} Days Used</span>
                  <span>{Math.round(usedPercentage)}% Consumption</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left/Middle: New Request Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">New Leave Request</h2>
              <p className="text-xs text-gray-400 mt-0.5">Please provide dates and validation reasons for approval</p>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Leave category</label>
                <select 
                  name="leaveTypeId" 
                  value={form.leaveTypeId} 
                  onChange={handleChange} 
                  className="w-full border border-gray-300 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white" 
                  required
                >
                  <option value="">Choose leave type...</option>
                  {balances.map((b) => (
                    <option key={b.leaveTypeId} value={b.leaveTypeId}>{b.leaveType} ({b.remaining} Days left)</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Start Date</label>
                  <input 
                    type="date" 
                    name="fromDate" 
                    value={form.fromDate} 
                    onChange={handleChange} 
                    className="w-full border border-gray-300 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">End Date</label>
                  <input 
                    type="date" 
                    name="toDate" 
                    value={form.toDate} 
                    onChange={handleChange} 
                    className="w-full border border-gray-300 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" 
                    required 
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Explain Reason (Optional)</label>
                <textarea 
                  name="reason" 
                  value={form.reason} 
                  onChange={handleChange} 
                  placeholder="Provide context for manager review..." 
                  rows={3} 
                  className="w-full border border-gray-300 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" 
                />
              </div>

              {balanceWarning && (
                <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
                  <div>
                    <span className="font-extrabold">Insufficient Balance:</span> You requested {daysRequested} days, but only have {balances.find(b => b.leaveTypeId === form.leaveTypeId)?.remaining || 0} days remaining.
                  </div>
                </div>
              )}

              <button 
                type="submit" 
                disabled={!form.leaveTypeId || !form.fromDate || !form.toDate || balanceWarning || submitLoading} 
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-100 disabled:text-gray-400 text-white rounded-xl font-bold text-sm shadow-md shadow-indigo-500/10 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
              >
                {submitLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <CalendarDays className="w-5 h-5" />
                )}
                {submitLoading ? "Submitting request..." : "Submit Leave Application"}
              </button>
            </form>
          </div>
        </div>

        {/* Right Sidebar: Dynamic Summary Preview */}
        <div className="space-y-6">
          
          {/* Summary Preview Box */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
            <h3 className="font-bold text-gray-800 text-base flex items-center gap-2">
              <Info className="w-5 h-5 text-gray-500" />
              Request Summary
            </h3>

            <div className="bg-gray-50 rounded-xl p-4 space-y-3 text-xs border border-gray-100">
              <div className="flex justify-between">
                <span className="text-gray-400">Category Selected:</span>
                <span className="font-bold text-gray-800">
                  {balances.find(b => b.leaveTypeId === form.leaveTypeId)?.leaveType || "None"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Total Duration:</span>
                <span className={`font-black ${daysRequested > 0 ? "text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100" : "text-gray-500"}`}>
                  {daysRequested > 0 ? `${daysRequested} Working Day${daysRequested > 1 ? "s" : ""}` : "—"}
                </span>
              </div>
              
              {form.fromDate && form.toDate && (
                <div className="border-t border-gray-200/50 pt-2.5 text-[11px] text-gray-500 leading-relaxed">
                  Leaves will cover from <strong className="text-gray-700">{form.fromDate}</strong> to <strong className="text-gray-700">{form.toDate}</strong>.
                </div>
              )}
            </div>
          </div>

          {/* Quick instructions/help */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-3 text-xs">
            <h3 className="font-bold text-gray-800 text-base flex items-center gap-2">
              <FileText className="w-5 h-5 text-gray-500" />
              Submission Guidelines
            </h3>
            <ul className="list-disc pl-4 space-y-2 text-gray-500">
              <li>Leave applications must be submitted at least 2 days in advance, except in case of emergencies.</li>
              <li>Your reporting manager will receive a notification and has full authority to approve/reject the request.</li>
              <li>Leave days will be deducted from your balance immediately once approved.</li>
            </ul>
          </div>

        </div>

      </div>

      {/* Leave Requests History Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Leave Applications History</h2>
            <p className="text-xs text-gray-400 mt-0.5">Track and view status of all previously submitted requests</p>
          </div>
        </div>

        {leaves.length === 0 ? (
          <div className="p-12 text-center text-gray-400 flex flex-col items-center justify-center gap-2">
            <Calendar className="w-8 h-8 text-gray-300" />
            <p className="font-semibold">No leave applications registered yet</p>
            <p className="text-xs text-gray-400">Use the form above to submit your first leave application.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left p-4 font-semibold text-gray-600">Category</th>
                  <th className="text-left p-4 font-semibold text-gray-600">From</th>
                  <th className="text-left p-4 font-semibold text-gray-600">To</th>
                  <th className="text-left p-4 font-semibold text-gray-600">Days</th>
                  <th className="text-left p-4 font-semibold text-gray-600">Reason</th>
                  <th className="text-left p-4 font-semibold text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {leaves.map((l) => (
                  <tr key={l._id} className="hover:bg-gray-50/50">
                    <td className="p-4 font-bold text-gray-900 flex items-center gap-2">
                      {getLeaveIcon(typeMap[l.leaveTypeId])}
                      <span>{typeMap[l.leaveTypeId] || "General Leave"}</span>
                    </td>
                    <td className="p-4 font-medium text-gray-700">{l.fromDate}</td>
                    <td className="p-4 font-medium text-gray-700">{l.toDate}</td>
                    <td className="p-4 font-semibold text-indigo-600">{l.totalDays} Day{l.totalDays > 1 ? "s" : ""}</td>
                    <td className="p-4 text-gray-500 max-w-xs truncate" title={l.reason}>{l.reason || "—"}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border ${badgeColor(l.status)}`}>
                        {l.status === "approved" && <CheckCircle2 className="w-3.5 h-3.5" />}
                        {l.status === "rejected" && <XCircle className="w-3.5 h-3.5" />}
                        {l.status === "pending" && <Clock className="w-3.5 h-3.5 animate-pulse" />}
                        <span className="capitalize">{l.status}</span>
                      </span>
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
