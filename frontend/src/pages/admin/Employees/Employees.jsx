import React, { useEffect, useState } from "react";
import api from "../../../utils/api";
import { Link } from "react-router-dom";
import { 
  Users, 
  Search, 
  ShieldAlert, 
  UserPlus, 
  Building2,
  Mail,
  UserCheck,
  AlertCircle
} from "lucide-react";

const Employees = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get("/admin/users");
        setUsers(res.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const getInitials = (name) => {
    if (!name) return "??";
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const roleBadgeColor = (role) => {
    const r = (role || "").toLowerCase();
    if (r === "admin") return "bg-purple-50 text-purple-700 border-purple-200";
    if (r === "manager") return "bg-indigo-50 text-indigo-700 border-indigo-200";
    return "bg-slate-50 text-slate-700 border-slate-200";
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch = 
      u.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      u.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // Calculate statistics
  const totalCount = users.length;
  const adminCount = users.filter((u) => u.role === "admin").length;
  const managerCount = users.filter((u) => u.role === "manager").length;
  const employeeCount = users.filter((u) => u.role === "employee").length;

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
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Employees</h1>
          <p className="text-gray-500 text-sm mt-1">Directory of all accounts registered within the workspace</p>
        </div>
        <Link 
          to="/admin/dashboard" 
          className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-2xl font-bold transition-all active:scale-[0.98] shadow-md shadow-indigo-600/10"
        >
          <UserPlus className="w-4.5 h-4.5" />
          <span>Provision User</span>
        </Link>
      </div>

      {/* Directory Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Total Accounts</span>
          <span className="text-2xl font-black text-gray-955 mt-2 font-mono">{totalCount}</span>
        </div>
        <div className="bg-indigo-50/20 p-4 rounded-2xl border border-indigo-100 shadow-sm flex flex-col justify-between">
          <span className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider">Managers</span>
          <span className="text-2xl font-black text-indigo-700 mt-2 font-mono">{managerCount}</span>
        </div>
        <div className="bg-slate-50 p-4 rounded-2xl border border-gray-250 shadow-sm flex flex-col justify-between">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Employees</span>
          <span className="text-2xl font-black text-slate-800 mt-2 font-mono">{employeeCount}</span>
        </div>
        <div className="bg-purple-50/20 p-4 rounded-2xl border border-purple-100 shadow-sm flex flex-col justify-between">
          <span className="text-[10px] text-purple-600 font-bold uppercase tracking-wider">Administrators</span>
          <span className="text-2xl font-black text-purple-700 mt-2 font-mono">{adminCount}</span>
        </div>
      </div>

      {/* Roster Database Card */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
        
        {/* Search & Role Filters */}
        <div className="p-5 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-50/50">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search by name or email address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            <span className="text-xs text-gray-400 font-bold uppercase mr-1 whitespace-nowrap">Filter Role:</span>
            {[
              { id: "all", label: "All Roles" },
              { id: "employee", label: "Employees" },
              { id: "manager", label: "Managers" },
              { id: "admin", label: "Admins" }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setRoleFilter(f.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border whitespace-nowrap cursor-pointer ${
                  roleFilter === f.id 
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-sm" 
                    : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Users Roster Table */}
        {filteredUsers.length === 0 ? (
          <div className="p-16 text-center text-gray-400 flex flex-col items-center justify-center gap-2">
            <AlertCircle className="w-8 h-8 text-gray-300" />
            <p className="font-semibold text-gray-800 text-sm">No employees match this criteria</p>
            <p className="text-xs text-gray-400">Try tweaking your search queries or role selections.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left p-4 font-semibold text-gray-600">Employee Details</th>
                  <th className="text-left p-4 font-semibold text-gray-600">Email Address</th>
                  <th className="text-left p-4 font-semibold text-gray-600">Assigned Role</th>
                  <th className="text-left p-4 font-semibold text-gray-600">User Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.map((u) => (
                  <tr key={u._id} className="hover:bg-indigo-50/10 transition-colors">
                    <td className="p-4 font-medium text-gray-900 flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-100 text-indigo-700 font-extrabold rounded-xl flex items-center justify-center text-sm shadow-inner">
                        {getInitials(u.name)}
                      </div>
                      <div>
                        <p className="font-bold text-gray-950 leading-tight">{u.name}</p>
                        <p className="text-[10px] text-gray-400 font-mono tracking-tight mt-0.5">{u._id}</p>
                      </div>
                    </td>
                    <td className="p-4 text-gray-600 font-mono">{u.email}</td>
                    <td className="p-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold border capitalize ${roleBadgeColor(u.role)}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1.5 text-emerald-600 font-bold text-xs uppercase tracking-wide">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                        {u.status || "active"}
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

export default Employees;
