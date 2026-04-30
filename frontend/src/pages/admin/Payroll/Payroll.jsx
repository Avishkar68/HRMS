import React, { useEffect, useState } from "react";
import api from "../../../utils/api";

const statusColor = (s) => {
  if (s === "paid") return "bg-emerald-100 text-emerald-800";
  if (s === "processed") return "bg-blue-100 text-blue-800";
  return "bg-amber-100 text-amber-800";
};

const Payroll = () => {
  const [payrolls, setPayrolls] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [calculation, setCalculation] = useState(null);
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
      setPayrolls(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get("/admin/users");
      setUsers(res.data.filter((u) => u.role === "employee" || u.role === "manager"));
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
      alert("Payroll created.");
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
    try {
      await api.patch(`/payroll/${id}`, { status });
      fetchPayrolls();
    } catch (err) {
      alert(err.response?.data?.message || "Error");
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payroll</h1>
          <p className="text-gray-500 text-sm mt-1">Manage salary and calculate payment from attendance</p>
        </div>
        <button
          onClick={() => {
            setOpen(true);
            fetchUsers();
            setCalculation(null);
          }}
          className="inline-flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-lg hover:bg-indigo-700 font-medium shadow-sm"
        >
          <span>+ Add Payroll</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {payrolls.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <p className="font-medium">No payroll records yet.</p>
            <p className="text-sm mt-1">Add payroll and use &quot;Calculate&quot; to set amount from monthly attendance.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left p-4 font-semibold text-gray-700">Employee</th>
                  <th className="text-left p-4 font-semibold text-gray-700">Month / Year</th>
                  <th className="text-right p-4 font-semibold text-gray-700">Base</th>
                  <th className="text-right p-4 font-semibold text-gray-700">Allowances</th>
                  <th className="text-right p-4 font-semibold text-gray-700">Net</th>
                  <th className="text-left p-4 font-semibold text-gray-700">Status</th>
                  <th className="text-left p-4 font-semibold text-gray-700">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {payrolls.map((p) => (
                  <tr key={p._id} className="hover:bg-gray-50/50">
                    <td className="p-4 font-medium text-gray-900">{p.userId?.name || p.userId}</td>
                    <td className="p-4 text-gray-600">{p.month} / {p.year}</td>
                    <td className="p-4 text-right">{p.baseSalary?.toLocaleString() ?? 0}</td>
                    <td className="p-4 text-right">{p.allowances?.toLocaleString() ?? 0}</td>
                    <td className="p-4 text-right font-semibold text-gray-900">{p.netSalary?.toLocaleString() ?? 0}</td>
                    <td className="p-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${statusColor(p.status)}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="p-4">
                      {p.status === "draft" && (
                        <span className="flex flex-wrap gap-2">
                          <button
                            onClick={() => updateStatus(p._id, "processed")}
                            className="text-indigo-600 hover:underline text-xs font-medium"
                          >
                            Process
                          </button>
                          <button
                            onClick={() => updateStatus(p._id, "paid")}
                            className="text-emerald-600 hover:underline text-xs font-medium"
                          >
                            Mark Paid
                          </button>
                        </span>
                      )}
                      {p.status === "processed" && (
                        <button
                          onClick={() => updateStatus(p._id, "paid")}
                          className="text-emerald-600 hover:underline text-xs font-medium"
                        >
                          Mark Paid
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-20 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg border border-gray-100 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Add Payroll</h2>
              <p className="text-gray-500 text-sm mt-1">Calculate payment from monthly attendance, then add allowances if needed.</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Employee</label>
                <select
                  name="userId"
                  value={form.userId}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                >
                  <option value="">Select employee</option>
                  {users.map((u) => (
                    <option key={u._id} value={u._id}>{u.name} ({u.role})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
                <input
                  type="month"
                  name="month"
                  value={form.month}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                <p className="text-sm font-medium text-amber-800 mb-2">Calculate from attendance</p>
                <div className="flex gap-2 flex-wrap">
                  <div className="flex-1 min-w-[140px]">
                    <label className="block text-xs text-amber-700 mb-1">Monthly base salary (full month)</label>
                    <input
                      type="number"
                      name="monthlyBaseSalary"
                      value={form.monthlyBaseSalary}
                      onChange={handleChange}
                      placeholder="e.g. 30000"
                      min="0"
                      className="w-full border border-amber-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={handleCalculate}
                      disabled={calculating || !form.userId || !form.month || !form.monthlyBaseSalary}
                      className="px-4 py-2.5 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      {calculating ? "Calculating…" : "Calculate"}
                    </button>
                  </div>
                </div>
                {calculation && (
                  <div className="mt-3 pt-3 border-t border-amber-200 text-sm text-amber-800">
                    <p><strong>Present:</strong> {calculation.presentDays} days · <strong>Working days:</strong> {calculation.workingDays}</p>
                    <p className="mt-1"><strong>Calculated amount:</strong> ₹{calculation.calculatedBaseAmount?.toLocaleString()}</p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Base salary (payment)</label>
                <input
                  type="number"
                  name="baseSalary"
                  value={form.baseSalary}
                  onChange={handleChange}
                  placeholder="Use Calculate or enter manually"
                  min="0"
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Allowances (extra)</label>
                <input
                  type="number"
                  name="allowances"
                  value={form.allowances}
                  onChange={handleChange}
                  placeholder="0"
                  min="0"
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deductions</label>
                <input
                  type="number"
                  name="deductions"
                  value={form.deductions}
                  onChange={handleChange}
                  placeholder="0"
                  min="0"
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Net payment: <strong className="text-gray-900">₹{netAmount().toLocaleString()}</strong></p>
              </div>
            </div>
            <div className="p-6 pt-0 flex gap-3">
              <button
                type="button"
                onClick={resetModal}
                className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-lg font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreate}
                className="flex-1 bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-700"
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
