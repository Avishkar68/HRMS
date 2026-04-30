import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../../utils/api";

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [open, setOpen] = useState(false);
  const [managers, setManagers] = useState([]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "employee",
    managerId: "",
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/admin/dashboard/stats");
        setStats(res.data);
      } catch (err) {
        console.error("Failed to load stats", err);
      }
    };
    fetchStats();
  }, []);

  useEffect(() => {
    if (!open) return;
    const fetchManagers = async () => {
      try {
        const res = await api.get("/admin/managers");
        setManagers(res.data);
      } catch (err) {
        console.error("Failed to load managers", err);
      }
    };
    fetchManagers();
  }, [open]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCreate = async () => {
    try {
      const payload = { name: form.name, email: form.email, password: form.password, role: form.role };
      if (form.role === "employee") payload.managerId = form.managerId;
      await api.post("/admin/users", payload);
      alert("User created successfully");
      setOpen(false);
      setForm({ name: "", email: "", password: "", role: "employee", managerId: "" });
      const res = await api.get("/admin/dashboard/stats");
      setStats(res.data);
    } catch (err) {
      alert(err.response?.data?.message || "Error creating user");
    }
  };

  const cards = [
    { label: "Total Users", value: stats?.userCount ?? 0, color: "indigo", link: "/admin/employees", icon: "👥" },
    { label: "Present Today", value: stats?.presentToday ?? 0, color: "emerald", link: "/admin/attendance", icon: "✓" },
    { label: "Pending Leaves", value: stats?.pendingLeaves ?? 0, color: "amber", link: "/admin/leave-requests", icon: "📋" },
    { label: "Managers", value: stats?.managerCount ?? 0, color: "slate", icon: null },
    { label: "Employees", value: stats?.employeeCount ?? 0, color: "slate", icon: null },
  ];

  const quickLinks = [
    { to: "/admin/employees", label: "Employees", desc: "View & manage users" },
    { to: "/admin/attendance", label: "Attendance", desc: "View attendance by date" },
    { to: "/admin/payroll", label: "Payroll", desc: "Salary & calculate from attendance" },
    { to: "/admin/leave-requests", label: "Leave Requests", desc: "Review leave applications" },
    { to: "/admin/reports", label: "Reports", desc: "Analytics & summaries" },
    { to: "/admin/settings", label: "Settings", desc: "Leave types & config" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Overview and quick actions</p>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="inline-flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-lg hover:bg-indigo-700 font-medium shadow-sm"
        >
          <span>+ Create User</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {c.link ? (
              <Link to={c.link} className="block p-5 hover:bg-gray-50/50 transition-colors">
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">{c.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{c.value}</p>
                <p className="text-xs text-indigo-600 mt-2 font-medium">View →</p>
              </Link>
            ) : (
              <div className="p-5">
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">{c.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{c.value}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Quick links</h2>
          <p className="text-gray-500 text-sm mt-0.5">Jump to key sections</p>
        </div>
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {quickLinks.map((q) => (
            <Link
              key={q.to}
              to={q.to}
              className="flex items-start gap-3 p-4 rounded-lg border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/30 transition-colors"
            >
              <span className="text-indigo-600 font-semibold">{q.label}</span>
              <span className="text-gray-500 text-sm">{q.desc}</span>
            </Link>
          ))}
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-20 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Create User</h2>
              <p className="text-gray-500 text-sm mt-1">Add a new employee or manager</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input name="name" value={form.name} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" placeholder="Full name" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input name="email" type="email" value={form.email} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" placeholder="email@company.com" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input name="password" type="password" value={form.password} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" placeholder="••••••••" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select name="role" value={form.role} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                  <option value="employee">Employee</option>
                  <option value="manager">Manager</option>
                </select>
              </div>
              {form.role === "employee" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Manager</label>
                  <select name="managerId" value={form.managerId} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" required>
                    <option value="">Select manager</option>
                    {managers.map((m) => (
                      <option key={m._id} value={m._id}>{m.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            <div className="p-6 pt-0 flex gap-3">
              <button type="button" onClick={() => setOpen(false)} className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-lg font-medium hover:bg-gray-50">Cancel</button>
              <button type="button" onClick={handleCreate} className="flex-1 bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-700">Create</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
