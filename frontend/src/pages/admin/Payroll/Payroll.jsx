import React, { useEffect, useState } from "react";
import api from "../../../utils/api";
import { 
  Coins, 
  Calculator, 
  Check, 
  AlertCircle, 
  Calendar, 
  User, 
  TrendingUp, 
  ArrowRight,
  X,
  CreditCard,
  CheckCircle,
  FileText
} from "lucide-react";

const statusColor = (s) => {
  const status = (s || "").toLowerCase();
  if (status === "paid") return "bg-emerald-50 text-emerald-700 border-emerald-250";
  if (status === "processed") return "bg-blue-50 text-blue-700 border-blue-250";
  return "bg-amber-50 text-amber-700 border-amber-250 border-dashed animate-pulse";
};

const Payroll = () => {
  const [payrolls, setPayrolls] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [calculation, setCalculation] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [form, setForm] = useState({
    userId: "",
    month: new Date().toISOString().slice(0, 7),
    monthlyBaseSalary: "",
    baseSalary: "",
    allowances: "0",
    deductions: "0",
  });

  const fetchPayrolls = async () => {
    try {
      const res = await api.get("/payroll");
      setPayrolls(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get("/admin/users");
      setUsers((res.data || []).filter((u) => u.role === "employee" || u.role === "manager"));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await Promise.all([fetchPayrolls(), fetchUsers()]);
      setLoading(false);
    };
    load();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (e.target.name === "userId" || e.target.name === "month" || e.target.name === "monthlyBaseSalary") {
      setCalculation(null);
    }
  };

  const handleCalculate = async () => {
    if (!form.userId || !form.month || !form.monthlyBaseSalary) {
      alert("Select employee, month and enter monthly base salary to calculate.");
      return;
    }
    setCalculating(true);
    setCalculation(null);
    try {
      const res = await api.get(
        `/payroll/calculate?userId=${form.userId}&month=${form.month}&monthlyBaseSalary=${form.monthlyBaseSalary}`
      );
      setCalculation(res.data);
      setForm((f) => ({ ...f, baseSalary: String(res.data.calculatedBaseAmount) }));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to calculate");
    } finally {
      setCalculating(false);
    }
  };

  const handleCreate = async () => {
    try {
      const [y] = form.month.split("-");
      const base = Number(form.baseSalary) || 0;
      const allow = Number(form.allowances) || 0;
      const deduct = Number(form.deductions) || 0;
      if (!form.userId || !form.month || base < 0) {
        alert("Employee, month and base salary (or use Calculate) required.");
        return;
      }
      await api.post("/payroll", {
        userId: form.userId,
        month: form.month,
        year: parseInt(y, 10),
        baseSalary: base,
        allowances: allow,
        deductions: deduct,
      });
      alert("Payroll created successfully.");
      setOpen(false);
      setCalculation(null);
      setForm({
        userId: "",
        month: new Date().toISOString().slice(0, 7),
        monthlyBaseSalary: "",
        baseSalary: "",
        allowances: "0",
        deductions: "0",
      });
      fetchPayrolls();
    } catch (err) {
      alert(err.response?.data?.message || "Error creating payroll");
    }
  };

  const updateStatus = async (id, status) => {
    setUpdatingId(id);
    try {
      await api.patch(`/payroll/${id}`, { status });
      await fetchPayrolls();
    } catch (err) {
      alert(err.response?.data?.message || "Error");
    } finally {
      setUpdatingId(null);
    }
  };

  const resetModal = () => {
    setCalculation(null);
    setForm({
      userId: "",
      month: new Date().toISOString().slice(0, 7),
      monthlyBaseSalary: "",
      baseSalary: "",
      allowances: "0",
      deductions: "0",
    });
    setOpen(false);
  };

  const netAmount = () => {
    const base = Number(form.baseSalary) || 0;
    const allow = Number(form.allowances) || 0;
    const deduct = Number(form.deductions) || 0;
    return base + allow - deduct;
  };

  const getInitials = (name) => {
    if (!name) return "??";
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  // Stats calculation
  const totalCount = payrolls.length;
  const draftCount = payrolls.filter(p => p.status === "draft").length;
  const processedCount = payrolls.filter(p => p.status === "processed").length;
  const paidCount = payrolls.filter(p => p.status === "paid").length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Payroll Ledger</h1>
          <p className="text-gray-500 text-sm mt-1">Manage salary sheets and calculate payments based on monthly attendance logs</p>
        </div>
        <button
          onClick={() => {
            setOpen(true);
            fetchUsers();
            setCalculation(null);
          }}
          className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-2xl font-bold transition-all active:scale-[0.98] shadow-md shadow-indigo-600/10 cursor-pointer"
        >
          <Coins className="w-4.5 h-4.5" />
          <span>Add Payroll</span>
        </button>
      </div>

      {/* Analytics Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Total Records</span>
          <span className="text-2xl font-black text-gray-955 mt-2 font-mono">{totalCount}</span>
        </div>
        <div className="bg-amber-50/20 p-4 rounded-2xl border border-amber-100 shadow-sm flex flex-col justify-between">
          <span className="text-[10px] text-amber-600 font-bold uppercase tracking-wider">Drafts Pending</span>
          <span className="text-2xl font-black text-amber-700 mt-2 font-mono">{draftCount}</span>
        </div>
        <div className="bg-blue-50/20 p-4 rounded-2xl border border-blue-100 shadow-sm flex flex-col justify-between">
          <span className="text-[10px] text-blue-600 font-bold uppercase tracking-wider">Processed Bills</span>
          <span className="text-2xl font-black text-blue-700 mt-2 font-mono">{processedCount}</span>
        </div>
        <div className="bg-emerald-50/20 p-4 rounded-2xl border border-emerald-100 shadow-sm flex flex-col justify-between">
          <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">Paid Salaries</span>
          <span className="text-2xl font-black text-emerald-700 mt-2 font-mono">{paidCount}</span>
        </div>
      </div>

      {/* Payroll Database Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
        {payrolls.length === 0 ? (
          <div className="p-16 text-center text-gray-400 flex flex-col items-center justify-center gap-2">
            <AlertCircle className="w-8 h-8 text-gray-300" />
            <p className="font-semibold text-gray-800 text-sm">No payroll records logged</p>
            <p className="text-xs text-gray-400">Click &quot;Add Payroll&quot; to calculate salary for an employee.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left p-4 font-semibold text-gray-600">Employee Details</th>
                  <th className="text-center p-4 font-semibold text-gray-600">Month / Year</th>
                  <th className="text-right p-4 font-semibold text-gray-600">Base Salary</th>
                  <th className="text-right p-4 font-semibold text-gray-600">Allowances</th>
                  <th className="text-right p-4 font-semibold text-gray-600">Net Salary</th>
                  <th className="text-center p-4 font-semibold text-gray-600">Payment Status</th>
                  <th className="text-right p-4 font-semibold text-gray-600">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {payrolls.map((p) => {
                  const empName = p.userId?.name || "Unassigned Employee";
                  return (
                    <tr key={p._id} className="hover:bg-indigo-50/10 transition-colors">
                      <td className="p-4 font-medium text-gray-900 flex items-center gap-3">
                        <div className="w-9 h-9 bg-indigo-50 text-indigo-700 font-extrabold rounded-xl flex items-center justify-center text-xs shadow-inner">
                          {getInitials(empName)}
                        </div>
                        <div>
                          <p className="font-bold text-gray-955">{empName}</p>
                          <p className="text-[10px] text-gray-450 font-mono">ID: {p.userId?._id || p.userId}</p>
                        </div>
                      </td>
                      <td className="p-4 text-center text-gray-600 font-mono font-medium">{p.month} / {p.year}</td>
                      <td className="p-4 text-right text-gray-600 font-mono">₹{p.baseSalary?.toLocaleString() ?? 0}</td>
                      <td className="p-4 text-right text-gray-650 font-mono">₹{p.allowances?.toLocaleString() ?? 0}</td>
                      <td className="p-4 text-right font-black text-gray-950 font-mono">₹{p.netSalary?.toLocaleString() ?? 0}</td>
                      <td className="p-4 text-center">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold border capitalize ${statusColor(p.status)}`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-2">
                          {p.status === "draft" && (
                            <>
                              <button
                                onClick={() => updateStatus(p._id, "processed")}
                                disabled={updatingId !== null}
                                className="px-3 py-1.5 bg-indigo-55 border border-indigo-200 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold transition-all active:scale-[0.98] cursor-pointer"
                              >
                                Process
                              </button>
                              <button
                                onClick={() => updateStatus(p._id, "paid")}
                                disabled={updatingId !== null}
                                className="px-3 py-1.5 bg-emerald-55 border border-emerald-250 hover:bg-emerald-100/70 text-emerald-700 rounded-xl text-xs font-bold transition-all active:scale-[0.98] cursor-pointer"
                              >
                                Mark Paid
                              </button>
                            </>
                          )}
                          {p.status === "processed" && (
                            <button
                              onClick={() => updateStatus(p._id, "paid")}
                              disabled={updatingId !== null}
                              className="px-3 py-1.5 bg-emerald-55 border border-emerald-250 hover:bg-emerald-100/70 text-emerald-700 rounded-xl text-xs font-bold transition-all active:scale-[0.98] cursor-pointer"
                            >
                              Mark Paid
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Payroll Modal */}
      {open && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg border border-gray-100 max-h-[90vh] overflow-y-auto overflow-x-hidden animate-fade-in flex flex-col">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-extrabold text-gray-900">Add Payroll Record</h2>
                <p className="text-gray-500 text-xs mt-0.5">Determine compensation based on employee presence logs</p>
              </div>
              <button 
                onClick={resetModal} 
                className="p-1.5 hover:bg-gray-200 rounded-xl text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Select Employee</label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <select
                    name="userId"
                    value={form.userId}
                    onChange={handleChange}
                    className="w-full border border-gray-250 rounded-xl pl-9 pr-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white cursor-pointer appearance-none"
                    required
                  >
                    <option value="">Select employee</option>
                    {users.map((u) => (
                      <option key={u._id} value={u._id}>{u.name} ({u.role})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Billing Month</label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="month"
                    name="month"
                    value={form.month}
                    onChange={handleChange}
                    className="w-full border border-gray-250 rounded-xl pl-9 pr-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white cursor-pointer"
                  />
                </div>
              </div>

              {/* Attendance Calculator Card */}
              <div className="p-4.5 bg-amber-50/50 rounded-2xl border border-amber-150 space-y-3">
                <div className="flex items-center gap-1.5 text-amber-800 font-extrabold text-xs uppercase tracking-wider">
                  <Calculator className="w-4 h-4" />
                  Calculate from Presence Logs
                </div>
                
                <div className="flex gap-2 items-end">
                  <div className="flex-1">
                    <label className="block text-[9px] text-amber-700 font-bold uppercase tracking-wider mb-1">Base Monthly Salary (e.g. ₹30,000)</label>
                    <input
                      type="number"
                      name="monthlyBaseSalary"
                      value={form.monthlyBaseSalary}
                      onChange={handleChange}
                      placeholder="e.g. 30000"
                      min="0"
                      className="w-full border border-amber-200 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleCalculate}
                    disabled={calculating || !form.userId || !form.month || !form.monthlyBaseSalary}
                    className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold disabled:opacity-40 disabled:cursor-not-allowed text-xs transition-all active:scale-[0.98]"
                  >
                    {calculating ? "Calculating…" : "Calculate"}
                  </button>
                </div>

                {calculation && (
                  <div className="pt-3 border-t border-amber-200/60 text-xs text-amber-850 space-y-1">
                    <p><strong>Present Days:</strong> {calculation.presentDays} Days</p>
                    <p><strong>Working Days in Month:</strong> {calculation.workingDays} Days</p>
                    <p className="text-sm font-black text-amber-900 pt-0.5">Calculated Base Amount: ₹{calculation.calculatedBaseAmount?.toLocaleString()}</p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Base Salary (₹)</label>
                  <input
                    type="number"
                    name="baseSalary"
                    value={form.baseSalary}
                    onChange={handleChange}
                    placeholder="Base Amount"
                    min="0"
                    className="w-full border border-gray-250 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Allowances (₹)</label>
                  <input
                    type="number"
                    name="allowances"
                    value={form.allowances}
                    onChange={handleChange}
                    placeholder="0"
                    min="0"
                    className="w-full border border-gray-250 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Deductions (₹)</label>
                  <input
                    type="number"
                    name="deductions"
                    value={form.deductions}
                    onChange={handleChange}
                    placeholder="0"
                    min="0"
                    className="w-full border border-gray-250 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                  />
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-150 flex items-center justify-between">
                <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Estimated Net Payment</span>
                <strong className="text-gray-950 font-black text-base font-mono">₹{netAmount().toLocaleString()}</strong>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-6 border-t border-gray-100 bg-gray-50 flex gap-3">
              <button
                type="button"
                onClick={resetModal}
                className="flex-1 border border-gray-250 text-gray-700 py-3 rounded-xl text-xs font-bold hover:bg-gray-100 transition-all active:scale-[0.98] cursor-pointer text-center"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreate}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl text-xs font-bold shadow-md shadow-indigo-600/10 transition-all active:scale-[0.98] cursor-pointer text-center"
              >
                Create Payroll
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default Payroll;
