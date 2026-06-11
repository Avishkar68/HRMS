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
  AlertCircle,
  X,
  Printer,
  Briefcase
} from "lucide-react";

const Employees = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState(null);
  const [activeModalTab, setActiveModalTab] = useState("details");

  const [editingSalary, setEditingSalary] = useState("");
  const [updatingSalary, setUpdatingSalary] = useState(false);

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

  useEffect(() => {
    if (selectedUser) {
      setEditingSalary(String(selectedUser.packageSalary || 0));
    } else {
      setEditingSalary("");
    }
  }, [selectedUser]);

  const handleUpdateSalary = async () => {
    if (!selectedUser) return;
    setUpdatingSalary(true);
    try {
      const res = await api.put(`/admin/users/${selectedUser._id}`, {
        packageSalary: Number(editingSalary) || 0
      });
      alert("Salary package updated successfully.");
      
      const updatedUser = res.data.user || { ...selectedUser, packageSalary: Number(editingSalary) || 0 };
      setUsers((prev) => prev.map((u) => u._id === selectedUser._id ? { ...u, ...updatedUser } : u));
      setSelectedUser((prev) => ({ ...prev, ...updatedUser }));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update package salary.");
    } finally {
      setUpdatingSalary(false);
    }
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
                  <tr 
                    key={u._id} 
                    onClick={() => {
                      setSelectedUser(u);
                      setActiveModalTab("details");
                    }}
                    className="hover:bg-indigo-50/10 transition-colors cursor-pointer"
                  >
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

      {/* Slide-over Drawer for Employee Details & Badge */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div 
            onClick={() => setSelectedUser(null)}
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity" 
          />

          {/* Drawer Body */}
          <div className="relative w-full max-w-lg bg-white shadow-2xl h-screen flex flex-col z-10 animate-in slide-in-from-right duration-250 border-l border-gray-150">
            {/* Drawer Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-indigo-100 text-indigo-750 font-extrabold rounded-2xl flex items-center justify-center text-base shadow-inner select-none">
                  {getInitials(selectedUser.name)}
                </div>
                <div>
                  <h3 className="font-extrabold text-gray-950 text-base leading-tight">{selectedUser.name}</h3>
                  <p className="text-xs text-gray-400 mt-0.5 capitalize">{selectedUser.role} Profile</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedUser(null)}
                className="p-1.5 hover:bg-slate-100 text-gray-400 hover:text-gray-655 rounded-xl transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex border-b border-gray-150 px-6 pt-2">
              <button
                onClick={() => setActiveModalTab("details")}
                className={`pb-3 px-4 font-bold text-xs uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
                  activeModalTab === "details"
                    ? "border-indigo-600 text-indigo-650"
                    : "border-transparent text-gray-400 hover:text-gray-700"
                }`}
              >
                Profile Details
              </button>
              <button
                onClick={() => setActiveModalTab("badge")}
                className={`pb-3 px-4 font-bold text-xs uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
                  activeModalTab === "badge"
                    ? "border-indigo-600 text-indigo-650"
                    : "border-transparent text-gray-400 hover:text-gray-700"
                }`}
              >
                Digital ID Badge
              </button>
            </div>

            {/* Drawer Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {activeModalTab === "details" && (
                <div className="space-y-6">
                  {/* Account detail group */}
                  <div className="space-y-4">
                    <h4 className="text-gray-800 font-extrabold text-xs uppercase tracking-wider border-b border-gray-100 pb-2">
                      System Credentials
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Full Name</span>
                        <span className="text-sm font-semibold text-gray-850">{selectedUser.name}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Email Address</span>
                        <span className="text-sm font-mono text-gray-750">{selectedUser.email}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Employee ID</span>
                        <span className="text-sm font-mono text-gray-655">{selectedUser._id}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Date Provisioned</span>
                        <span className="text-sm font-semibold text-gray-850">
                          {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' }) : "—"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Organization group */}
                  <div className="space-y-4">
                    <h4 className="text-gray-800 font-extrabold text-xs uppercase tracking-wider border-b border-gray-100 pb-2">
                      Corporate Organization
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Direct Manager</span>
                        <span className="text-sm font-semibold text-gray-850">
                          {selectedUser.managerId ? (
                            users.find(x => x._id === selectedUser.managerId)?.name || "Manager Assigned"
                          ) : (
                            <span className="text-gray-400 italic font-normal text-xs">No direct manager</span>
                          )}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Corporate Role</span>
                        <span className="text-sm font-semibold text-gray-850 capitalize">{selectedUser.role}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Department</span>
                        <span className="text-sm font-semibold text-gray-850">General Operations</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Account Status</span>
                        <span className="inline-flex items-center gap-1 text-emerald-600 font-bold text-xs uppercase tracking-wider mt-0.5">
                          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                          {selectedUser.status || "active"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Compensation & Package Group */}
                  <div className="space-y-4 pt-4 border-t border-gray-100">
                    <h4 className="text-gray-800 font-extrabold text-xs uppercase tracking-wider pb-1 flex items-center gap-1.5">
                      <Briefcase className="w-4 h-4 text-gray-450" />
                      Compensation & Salary Package
                    </h4>
                    
                    <div className="p-4 bg-slate-50 border border-gray-150 rounded-2xl flex flex-col gap-3">
                      <div>
                        <label className="block text-[10px] text-gray-455 font-bold uppercase tracking-wider mb-1">Package Salary (Base Monthly, ₹)</label>
                        <div className="flex gap-2 items-center">
                          <div className="relative flex-1">
                            <span className="font-extrabold text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 text-xs select-none">₹</span>
                            <input
                              type="number"
                              value={editingSalary}
                              onChange={(e) => setEditingSalary(e.target.value)}
                              className="w-full border border-gray-250 bg-white rounded-xl pl-7 pr-3 py-2 text-xs font-mono focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none font-medium text-gray-900"
                              placeholder="e.g. 50000"
                              min="0"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={handleUpdateSalary}
                            disabled={updatingSalary}
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-wait shrink-0 shadow-sm"
                          >
                            {updatingSalary ? "Saving…" : "Update Package"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeModalTab === "badge" && (
                <div className="flex flex-col items-center space-y-6">
                  <button 
                    onClick={() => window.print()}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all active:scale-[0.98] shadow-md shadow-indigo-500/10 cursor-pointer animate-pulse"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    Print ID Badge
                  </button>

                  <div id="employee-id-badge" className="w-72 h-[420px] bg-slate-950 text-white rounded-3xl p-5 shadow-2xl relative border-4 border-indigo-500 overflow-hidden flex flex-col justify-between items-center bg-gradient-to-b from-indigo-950 via-slate-900 to-slate-950 print:border-indigo-650">
                    {/* Decorative Holographic Chip */}
                    <div className="absolute top-24 right-6 w-10 h-8 bg-amber-400/20 border border-amber-400/40 rounded-lg flex flex-col justify-between p-1 opacity-60">
                      <div className="w-full h-[1px] bg-amber-400/40" />
                      <div className="w-full h-[1px] bg-amber-400/40" />
                      <div className="w-full h-[1px] bg-amber-400/40" />
                    </div>

                    {/* Corporate Header */}
                    <div className="flex flex-col items-center space-y-1 w-full text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Briefcase className="w-4 h-4 text-indigo-400" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-indigo-200">HRMS CORPORATE</span>
                      </div>
                      <div className="w-12 h-[2px] bg-indigo-500 rounded-full mx-auto" />
                    </div>

                    {/* Avatar Section */}
                    <div className="flex flex-col items-center space-y-3 mt-2">
                      <div className="w-20 h-20 bg-indigo-600 text-white rounded-2xl flex items-center justify-center text-2xl font-black shadow-lg shadow-indigo-655/30 border-2 border-indigo-400 relative select-none">
                        {getInitials(selectedUser.name)}
                        <div className="absolute -bottom-1.5 px-2 py-0.5 bg-emerald-500 text-white font-extrabold text-[8px] uppercase tracking-wider rounded-full border border-slate-950 shadow">
                          ACTIVE
                        </div>
                      </div>

                      <div className="text-center space-y-0.5">
                        <h4 className="font-extrabold text-sm text-slate-100 tracking-tight leading-none mt-1">{selectedUser.name}</h4>
                        <p className="text-[9px] text-indigo-300 font-bold uppercase tracking-wider">{selectedUser.role}</p>
                      </div>
                    </div>

                    {/* Corporate Metadata Block */}
                    <div className="w-full bg-slate-900/50 border border-slate-800/80 rounded-2xl p-3 text-center space-y-1.5">
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-gray-400 font-bold uppercase">ID Number</span>
                        <span className="font-mono text-gray-200 font-semibold">{selectedUser._id.substring(0, 10).toUpperCase()}</span>
                      </div>
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-gray-400 font-bold uppercase">Department</span>
                        <span className="text-gray-200 font-semibold">General Operations</span>
                      </div>
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-gray-400 font-bold uppercase">Issued Date</span>
                        <span className="text-indigo-200 font-semibold">
                          {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "N/A"}
                        </span>
                      </div>
                    </div>

                    {/* Barcode */}
                    <div className="w-full flex flex-col items-center mt-1 space-y-1">
                      <div className="h-6 w-44 bg-white p-1 rounded-sm flex items-center justify-around opacity-90">
                        <div className="w-[2px] h-4 bg-black" />
                        <div className="w-[1px] h-4 bg-black" />
                        <div className="w-[3px] h-4 bg-black" />
                        <div className="w-[1px] h-4 bg-black" />
                        <div className="w-[2px] h-4 bg-black" />
                        <div className="w-[1px] h-4 bg-black" />
                        <div className="w-[3px] h-4 bg-black" />
                        <div className="w-[2px] h-4 bg-black" />
                        <div className="w-[1px] h-4 bg-black" />
                        <div className="w-[2px] h-4 bg-black" />
                        <div className="w-[4px] h-4 bg-black" />
                        <div className="w-[1px] h-4 bg-black" />
                      </div>
                      <span className="text-[7px] text-gray-500 font-black tracking-widest font-mono uppercase">Secure Corporate ID Access</span>
                    </div>
                  </div>
                  
                  {/* Local style tag to isolate print functionality */}
                  <style dangerouslySetInnerHTML={{__html: `
                    @media print {
                      body * {
                        visibility: hidden !important;
                      }
                      #employee-id-badge, #employee-id-badge * {
                        visibility: visible !important;
                      }
                      #employee-id-badge {
                        position: absolute !important;
                        left: 50% !important;
                        top: 50% !important;
                        transform: translate(-50%, -50%) scale(1.5) !important;
                        border-color: #4f46e5 !important;
                        box-shadow: none !important;
                      }
                    }
                  `}} />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Employees;
