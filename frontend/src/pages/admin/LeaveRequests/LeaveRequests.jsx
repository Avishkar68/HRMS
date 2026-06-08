import React, { useEffect, useState } from "react";
import api from "../../../utils/api";
import { 
  CalendarClock, 
  Search, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  User, 
  Tag, 
  Eye, 
  ChevronRight,
  Briefcase
} from "lucide-react";

const getStatusColor = (status) => {
  const s = (status || "").toLowerCase();
  if (s === "approved") return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (s === "rejected") return "bg-rose-50 text-rose-700 border-rose-200";
  return "bg-amber-50 text-amber-700 border-amber-200";
};

const LeaveRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await api.get("/admin/leaves");
        setRequests(res.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
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

  const filteredRequests = requests.filter((r) => {
    const name = r.employee?.name || "";
    const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate statistics
  const totalRequests = requests.length;
  const pendingCount = requests.filter((r) => r.status === "pending").length;
  const approvedCount = requests.filter((r) => r.status === "approved").length;
  const rejectedCount = requests.filter((r) => r.status === "rejected").length;

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
          <h1 className="text-3xl font-extrabold text-gray-950 tracking-tight">Leave Registry</h1>
          <p className="text-gray-500 text-sm mt-1">Review leave applications and workflow history across the corporation</p>
        </div>
      </div>

      {/* Aggregate Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Total Applications</span>
          <span className="text-2xl font-black text-gray-955 mt-2 font-mono">{totalRequests}</span>
        </div>
        <div className="bg-amber-50/20 p-4 rounded-2xl border border-amber-100 shadow-sm flex flex-col justify-between">
          <span className="text-[10px] text-amber-600 font-bold uppercase tracking-wider">Pending Decisions</span>
          <span className="text-2xl font-black text-amber-700 mt-2 font-mono">{pendingCount}</span>
        </div>
        <div className="bg-emerald-50/20 p-4 rounded-2xl border border-emerald-100 shadow-sm flex flex-col justify-between">
          <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">Approved Leave</span>
          <span className="text-2xl font-black text-emerald-700 mt-2 font-mono">{approvedCount}</span>
        </div>
        <div className="bg-rose-50/20 p-4 rounded-2xl border border-rose-100 shadow-sm flex flex-col justify-between">
          <span className="text-[10px] text-rose-600 font-bold uppercase tracking-wider">Rejected Requests</span>
          <span className="text-2xl font-black text-rose-700 mt-2 font-mono">{rejectedCount}</span>
        </div>
      </div>

      {/* Roster database listings */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
        
        {/* Search & Status Filters */}
        <div className="p-5 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-50/50">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search by employee name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            <span className="text-xs text-gray-400 font-bold uppercase mr-1 whitespace-nowrap">Filter Status:</span>
            {[
              { id: "all", label: "All Requests" },
              { id: "pending", label: "Pending" },
              { id: "approved", label: "Approved" },
              { id: "rejected", label: "Rejected" }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setStatusFilter(f.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border whitespace-nowrap cursor-pointer ${
                  statusFilter === f.id 
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-sm" 
                    : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Requests Table */}
        {filteredRequests.length === 0 ? (
          <div className="p-16 text-center text-gray-400 flex flex-col items-center justify-center gap-2">
            <AlertCircle className="w-8 h-8 text-gray-300" />
            <p className="font-semibold text-gray-800 text-sm">No leave requests found</p>
            <p className="text-xs text-gray-400">There are no leave applications matching this criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left p-4 font-semibold text-gray-600">Employee Details</th>
                  <th className="text-left p-4 font-semibold text-gray-600">Leave Period</th>
                  <th className="text-left p-4 font-semibold text-gray-600">Leave Category</th>
                  <th className="text-left p-4 font-semibold text-gray-600">Duration</th>
                  <th className="text-left p-4 font-semibold text-gray-600">Reason / Details</th>
                  <th className="text-center p-4 font-semibold text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredRequests.map((r) => {
                  const empName = r.employee?.name || "Unassigned Employee";
                  const leaveType = r.leaveType?.name || r.leaveType || "Leave Request";
                  return (
                    <tr key={r._id} className="hover:bg-indigo-50/10 transition-colors">
                      <td className="p-4 font-medium text-gray-900 flex items-center gap-3">
                        <div className="w-9 h-9 bg-indigo-50 text-indigo-700 font-extrabold rounded-xl flex items-center justify-center text-xs shadow-inner">
                          {getInitials(empName)}
                        </div>
                        <div>
                          <p className="font-bold text-gray-955">{empName}</p>
                          <p className="text-[10px] text-gray-400 font-mono">ID: {r.userId}</p>
                        </div>
                      </td>
                      <td className="p-4 text-gray-600 font-mono text-xs">
                        <span>{r.fromDate ? new Date(r.fromDate).toLocaleDateString() : "—"}</span>
                        <span className="mx-1 text-gray-400">to</span>
                        <span>{r.toDate ? new Date(r.toDate).toLocaleDateString() : "—"}</span>
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-bold font-mono border border-indigo-150 capitalize">
                          {leaveType}
                        </span>
                      </td>
                      <td className="p-4 font-bold text-gray-800 font-mono">{r.totalDays} Day{r.totalDays !== 1 ? "s" : ""}</td>
                      <td className="p-4 text-gray-500 max-w-xs truncate" title={r.reason}>
                        {r.reason || "No details provided"}
                      </td>
                      <td className="p-4 text-center">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold border capitalize ${getStatusColor(r.status)}`}>
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  );
};

export default LeaveRequests;
