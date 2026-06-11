import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../../utils/api";
import {
  Users,
  CheckCircle,
  CalendarClock,
  UserCheck,
  Briefcase,
  UserPlus,
  ArrowRight,
  Plus,
  Mail,
  Lock,
  User,
  Shield,
  Layers,
  X,
  Sparkles,
  Sliders
} from "lucide-react";

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
    packageSalary: "",
  });

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

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
      const payload = { 
        name: form.name, 
        email: form.email, 
        password: form.password, 
        role: form.role,
        packageSalary: Number(form.packageSalary) || 0
      };
      if (form.role === "employee") payload.managerId = form.managerId;
      await api.post("/admin/users", payload);
      alert("User created successfully");
      setOpen(false);
      setForm({ name: "", email: "", password: "", role: "employee", managerId: "", packageSalary: "" });
      const res = await api.get("/admin/dashboard/stats");
      setStats(res.data);
    } catch (err) {
      alert(err.response?.data?.message || "Error creating user");
    }
  };

  const cards = [
    { label: "Total Users", value: stats?.userCount ?? 0, color: "indigo", link: "/admin/employees", icon: Users, desc: "Active directory users" },
    { label: "Present Today", value: stats?.presentToday ?? 0, color: "emerald", link: "/admin/attendance", icon: CheckCircle, desc: "Checked-in staff today" },
    { label: "Pending Leaves", value: stats?.pendingLeaves ?? 0, color: "amber", link: "/admin/leave-requests", icon: CalendarClock, desc: "Awaiting decision" },
    { label: "Managers", value: stats?.managerCount ?? 0, color: "sky", icon: UserCheck, desc: "Direct team leaders" },
    { label: "Employees", value: stats?.employeeCount ?? 0, color: "slate", icon: Briefcase, desc: "Staff members" },
  ];

  const quickLinks = [
    { to: "/admin/employees", label: "Employees", desc: "View & manage directory", icon: Users },
    { to: "/admin/attendance", label: "Attendance", desc: "View attendance records", icon: CheckCircle },
    { to: "/admin/payroll", label: "Payroll", desc: "Salary & calculate pay", icon: Layers },
    { to: "/admin/leave-requests", label: "Leave Requests", desc: "Review leave registry", icon: CalendarClock },
    { to: "/admin/reports", label: "Reports", desc: "View reports & analytics", icon: Sparkles },
    { to: "/admin/settings", label: "Settings", desc: "Leave types & system config", icon: Sliders },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome & Action Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 p-6 md:p-8 rounded-3xl text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden border border-slate-800">
        <div className="absolute right-0 top-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-1.5 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-xs font-bold uppercase tracking-wider text-indigo-300">
            <Sparkles className="w-3.5 h-3.5" />
            Console Overview
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Welcome back, {currentUser.name || "Administrator"}</h1>
          <p className="text-slate-350 text-sm max-w-xl">
            Welcome to the HRMS central cockpit. Here you can configure departments, calculate payroll, track attendance logs, and provision accounts.
          </p>
        </div>

        <button
          onClick={() => setOpen(true)}
          className="relative z-10 inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-3 rounded-2xl font-bold transition-all active:scale-[0.98] shadow-lg shadow-indigo-600/20 cursor-pointer self-start md:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Provision User</span>
        </button>
      </div>

      {/* Analytics Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {cards.map((c) => {
          const IconComponent = c.icon;
          const content = (
            <div className="p-5 flex flex-col justify-between h-full space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{c.label}</span>
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center bg-gray-50 border border-gray-150`}>
                  <IconComponent className="w-4 h-4 text-gray-600" />
                </div>
              </div>
              <div>
                <p className="text-3xl font-black text-gray-950 font-mono tracking-tight">{c.value}</p>
                <p className="text-[10px] text-gray-400 font-medium mt-0.5">{c.desc}</p>
              </div>
              {c.link && (
                <div className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider flex items-center gap-1 mt-2">
                  Launch View <ArrowRight className="w-3 h-3" />
                </div>
              )}
            </div>
          );

          return (
            <div key={c.label} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all">
              {c.link ? (
                <Link to={c.link} className="block h-full hover:bg-indigo-50/10">
                  {content}
                </Link>
              ) : (
                <div className="h-full">
                  {content}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Quick Links Section */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-base font-extrabold text-gray-950">Quick Workspace Links</h2>
          <p className="text-gray-500 text-xs mt-0.5">Direct shortcuts to system actions</p>
        </div>
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickLinks.map((q) => {
            const LinkIcon = q.icon;
            return (
              <Link
                key={q.to}
                to={q.to}
                className="flex items-start gap-4 p-4 rounded-2xl border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/10 hover:shadow-sm transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-150 flex items-center justify-center group-hover:bg-indigo-50 group-hover:border-indigo-100 transition-colors">
                  <LinkIcon className="w-5 h-5 text-gray-600 group-hover:text-indigo-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="block font-bold text-gray-900 text-sm group-hover:text-indigo-600 transition-colors">{q.label}</span>
                  <span className="block text-gray-400 text-xs mt-0.5 truncate">{q.desc}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Create User Modal */}
      {open && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md border border-gray-100 overflow-hidden flex flex-col animate-fade-in">

            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-extrabold text-gray-950">Provision User</h2>
                <p className="text-gray-500 text-xs mt-0.5">Provision an employee or manager credentials</p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 hover:bg-gray-200 rounded-xl text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className="w-full border border-gray-250 rounded-xl pl-10 pr-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                    placeholder="e.g. Avishkar Kumar"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Corporate Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    className="w-full border border-gray-250 rounded-xl pl-10 pr-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                    placeholder="email@company.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Password Credentials</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    name="password"
                    type="password"
                    value={form.password}
                    onChange={handleChange}
                    className="w-full border border-gray-250 rounded-xl pl-10 pr-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Role Type</label>
                  <div className="relative">
                    <Shield className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <select
                      name="role"
                      value={form.role}
                      onChange={handleChange}
                      className="w-full border border-gray-255 rounded-xl pl-9 pr-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white cursor-pointer appearance-none"
                    >
                      <option value="employee">Employee</option>
                      <option value="manager">Manager</option>
                    </select>
                  </div>
                </div>

                {form.role === "employee" && (
                  <div>
                    <label className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Assign Manager</label>
                    <div className="relative">
                      <UserCheck className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <select
                        name="managerId"
                        value={form.managerId}
                        onChange={handleChange}
                        className="w-full border border-gray-255 rounded-xl pl-9 pr-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white cursor-pointer appearance-none"
                        required
                      >
                        <option value="">Select manager</option>
                        {managers.map((m) => (
                          <option key={m._id} value={m._id}>{m.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Package Salary (Base Monthly Amount in ₹)</label>
                <div className="relative">
                  <span className="font-extrabold text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 text-sm select-none">₹</span>
                  <input
                    name="packageSalary"
                    type="number"
                    value={form.packageSalary}
                    onChange={handleChange}
                    className="w-full border border-gray-250 rounded-xl pl-8 pr-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white font-mono"
                    placeholder="e.g. 50000"
                    min="0"
                  />
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-6 border-t border-gray-100 bg-gray-50 flex gap-3">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex-1 border border-gray-250 text-gray-700 py-3 rounded-xl text-xs font-bold hover:bg-gray-100 transition-all active:scale-[0.98] cursor-pointer text-center"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreate}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl text-xs font-bold shadow-md shadow-indigo-600/10 transition-all active:scale-[0.98] cursor-pointer text-center"
              >
                Create User
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
