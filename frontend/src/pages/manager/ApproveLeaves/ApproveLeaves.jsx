import React, { useEffect, useState } from "react";
import api from "../../../utils/api";
import { 
  Calendar, 
  Clock, 
  Check, 
  X, 
  Search, 
  AlertCircle,
  FileText,
  Filter,
  CheckCircle,
  XCircle,
  Building,
  User,
  ArrowRight
} from "lucide-react";

const ApproveLeaves = () => {
  const [leaves, setLeaves] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [updatingId, setUpdatingId] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchLeaves = async () => {
    try {
      const res = await api.get("/manager/leaves");
      setLeaves(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const updateStatus = async (id, status) => {
    setUpdatingId(id);
    try {
      await api.patch(`/manager/leaves/${id}`, { status });
      await fetchLeaves();
      setSelectedRequest(null);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

  const badgeColor = (s) => {
    if (s === "approved") return "bg-emerald-50 text-emerald-700 border-emerald-250";
    if (s === "rejected") return "bg-rose-50 text-rose-700 border-rose-250";
    return "bg-amber-50 text-amber-700 border-amber-250 border-dashed animate-pulse";
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
  const totalRequests = leaves.length;
  const pendingCount = leaves.filter(l => l.status === "pending").length;
  const approvedCount = leaves.filter(l => l.status === "approved").length;
  const rejectedCount = leaves.filter(l => l.status === "rejected").length;

  const filteredLeaves = leaves.filter(l => {
    const matchesSearch = l.employee?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = statusFilter === "all" || l.status === statusFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Approve Leaves</h1>
        <p className="text-gray-500 text-sm mt-1">Review, approve, or reject employee leave applications</p>
      </div>

      {/* Analytics Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Total Requests</span>
          <span className="text-2xl font-black text-gray-955 mt-2 font-mono">{totalRequests}</span>
        </div>
        <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-100 shadow-sm flex flex-col justify-between">
          <span className="text-[10px] text-amber-600 font-bold uppercase tracking-wider">Pending Action</span>
          <span className="text-2xl font-black text-amber-700 mt-2 font-mono">{pendingCount}</span>
        </div>
        <div className="bg-emerald-50/30 p-4 rounded-2xl border border-emerald-100 shadow-sm flex flex-col justify-between">
          <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">Approved Requests</span>
          <span className="text-2xl font-black text-emerald-700 mt-2 font-mono">{approvedCount}</span>
        </div>
        <div className="bg-rose-50/30 p-4 rounded-2xl border border-rose-100 shadow-sm flex flex-col justify-between">
          <span className="text-[10px] text-rose-600 font-bold uppercase tracking-wider">Rejected Requests</span>
          <span className="text-2xl font-black text-rose-700 mt-2 font-mono">{rejectedCount}</span>
        </div>
      </div>

      {/* Main Workspace Card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        
        {/* Filter Controls */}
        <div className="p-5 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-50/50">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search employee name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-xl pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            <span className="text-xs text-gray-400 font-bold uppercase mr-1 whitespace-nowrap">Filter Status:</span>
            {[
              { id: "all", label: "All" },
              { id: "pending", label: "Pending" },
              { id: "approved", label: "Approved" },
              { id: "rejected", label: "Rejected" }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setStatusFilter(f.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap border ${
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
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-600 border-t-transparent mx-auto" />
          </div>
        ) : filteredLeaves.length === 0 ? (
          <div className="p-16 text-center text-gray-400 flex flex-col items-center justify-center gap-2">
            <AlertCircle className="w-8 h-8 text-gray-300" />
            <p className="font-semibold text-gray-800 text-sm">No leave requests found</p>
            <p className="text-xs text-gray-400">Applications reporting to you will appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left p-4 font-semibold text-gray-600">Employee</th>
                  <th className="text-left p-4 font-semibold text-gray-600">Leave Type</th>
                  <th className="text-center p-4 font-semibold text-gray-600">From</th>
                  <th className="text-center p-4 font-semibold text-gray-600">To</th>
                  <th className="text-center p-4 font-semibold text-gray-600">Requested Days</th>
                  <th className="text-center p-4 font-semibold text-gray-600">Status</th>
                  <th className="text-right p-4 font-semibold text-gray-600">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredLeaves.map((l) => (
                  <tr key={l._id} className="hover:bg-indigo-50/10 transition-colors">
                    <td className="p-4 font-medium text-gray-900 flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-100 text-indigo-700 font-extrabold rounded-xl flex items-center justify-center text-sm shadow-inner">
                        {getInitials(l.employee?.name)}
                      </div>
                      <div>
                        <p className="font-bold text-gray-950">{l.employee?.name}</p>
                        <p className="text-[10px] text-gray-400 font-mono">{l.employee?.email}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="font-bold text-gray-800 text-xs uppercase tracking-wide">
                        {l.leaveType?.name || "General Leave"}
                      </span>
                    </td>
                    <td className="p-4 text-center text-gray-600 font-mono font-medium">{l.fromDate}</td>
                    <td className="p-4 text-center text-gray-600 font-mono font-medium">{l.toDate}</td>
                    <td className="p-4 text-center font-bold text-gray-900">{l.totalDays}</td>
                    <td className="p-4 text-center">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold border ${badgeColor(l.status)}`}>
                        {l.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => setSelectedRequest(l)}
                          className="px-3 py-1.5 bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100 rounded-xl text-xs font-bold transition-all active:scale-[0.98]"
                        >
                          Review
                        </button>
                        {l.status === "pending" && (
                          <>
                            <button 
                              onClick={() => updateStatus(l._id, "approved")}
                              disabled={updatingId !== null}
                              className="p-1.5 bg-emerald-50 border border-emerald-200 text-emerald-600 hover:bg-emerald-100 rounded-xl transition-all active:scale-[0.98]"
                              title="Quick Approve"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => updateStatus(l._id, "rejected")}
                              disabled={updatingId !== null}
                              className="p-1.5 bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100 rounded-xl transition-all active:scale-[0.98]"
                              title="Quick Reject"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Review Request Modal Detail View */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col border border-gray-100 animate-fade-in">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                <h3 className="font-extrabold text-gray-800 text-sm uppercase tracking-wider">Review Leave Application</h3>
              </div>
              <button 
                onClick={() => setSelectedRequest(null)} 
                className="p-1 hover:bg-gray-200 rounded-lg text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              
              {/* Employee Bio */}
              <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                <div className="w-12 h-12 bg-indigo-100 text-indigo-700 font-extrabold rounded-2xl flex items-center justify-center text-base shadow-inner">
                  {getInitials(selectedRequest.employee?.name)}
                </div>
                <div>
                  <h4 className="font-extrabold text-gray-950 text-base">{selectedRequest.employee?.name}</h4>
                  <p className="text-xs text-gray-400">Reporting Employee</p>
                </div>
              </div>

              {/* Leave Meta Details */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Leave Type</span>
                    <span className="text-xs font-bold text-gray-800 uppercase bg-gray-100 px-2 py-0.5 rounded-lg">
                      {selectedRequest.leaveType?.name || "General Leave"}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Total Duration</span>
                    <span className="text-xs font-black text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-lg">
                      {selectedRequest.totalDays} Work Day{selectedRequest.totalDays > 1 ? "s" : ""}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-1">
                  <div className="space-y-1">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Start Date</span>
                    <span className="text-xs font-bold text-gray-800 font-mono">{selectedRequest.fromDate}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">End Date</span>
                    <span className="text-xs font-bold text-gray-800 font-mono">{selectedRequest.toDate}</span>
                  </div>
                </div>

                <div className="pt-2">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">Reason for Leave</span>
                  <div className="bg-gray-50 border border-gray-150 rounded-2xl p-4 text-xs italic text-gray-700 font-medium">
                    &quot;{selectedRequest.reason || "No explanation provided."}&quot;
                  </div>
                </div>
              </div>

            </div>

            {/* Modal Actions */}
            <div className="p-5 border-t border-gray-100 bg-gray-50 flex gap-3">
              {selectedRequest.status === "pending" ? (
                <>
                  <button 
                    onClick={() => updateStatus(selectedRequest._id, "rejected")}
                    disabled={updatingId !== null}
                    className="flex-1 border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl py-2.5 text-xs font-bold active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <X className="w-4 h-4 text-rose-500" />
                    Reject Application
                  </button>
                  <button 
                    onClick={() => updateStatus(selectedRequest._id, "approved")}
                    disabled={updatingId !== null}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl py-2.5 text-xs font-bold shadow-md shadow-emerald-500/15 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    Approve Application
                  </button>
                </>
              ) : (
                <button 
                  onClick={() => setSelectedRequest(null)}
                  className="w-full bg-gray-950 text-white rounded-xl py-2.5 text-xs font-bold hover:bg-gray-900 active:scale-[0.98] transition-all cursor-pointer text-center"
                >
                  Close Review
                </button>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default ApproveLeaves;
