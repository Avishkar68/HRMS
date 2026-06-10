import React, { useEffect, useState } from "react";
import api from "../../../utils/api";
import { 
  Search, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  AlertCircle,
  X,
  Calendar,
  FolderOpen
} from "lucide-react";

const AdminTimesheets = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  
  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Edit Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalLog, setModalLog] = useState(null);
  const [modalForm, setModalForm] = useState({
    date: "",
    hours: 8,
    project: "",
    description: "",
    status: ""
  });
  const [errorMsg, setErrorMsg] = useState("");

  const fetchLogs = async () => {
    try {
      const res = await api.get("/timesheets");
      setLogs(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      await fetchLogs();
      setLoading(false);
    };
    initData();
  }, []);

  const handleOpenEditModal = (log) => {
    setErrorMsg("");
    setModalLog(log);
    setModalForm({
      date: log.date ? new Date(log.date).toISOString().split("T")[0] : "",
      hours: log.hours,
      project: log.project || "General",
      description: log.description || "",
      status: log.status || "pending"
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setModalLog(null);
    setErrorMsg("");
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!modalForm.date) {
      setErrorMsg("Date is required");
      return;
    }
    if (modalForm.hours < 1 || modalForm.hours > 24) {
      setErrorMsg("Hours must be between 1 and 24");
      return;
    }
    if (!modalForm.project.trim()) {
      setErrorMsg("Project is required");
      return;
    }

    setActionLoading(true);
    try {
      const res = await api.put(`/timesheets/${modalLog._id}`, modalForm);
      setLogs(logs.map(l => l._id === modalLog._id ? res.data : l));
      handleCloseModal();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Failed to update timesheet log");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteLog = async (id) => {
    if (!window.confirm("Are you sure you want to delete this timesheet log? This action is permanent.")) return;

    try {
      await api.delete(`/timesheets/${id}`);
      setLogs(logs.filter(l => l._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete timesheet");
    }
  };

  const filteredLogs = logs.filter((l) => {
    const matchesSearch = 
      l.userId?.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      l.project?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || l.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Calculations
  const totalHours = filteredLogs.reduce((acc, l) => acc + l.hours, 0);
  const approvedHours = filteredLogs.filter(l => l.status === "approved").reduce((acc, l) => acc + l.hours, 0);
  const pendingHours = filteredLogs.filter(l => l.status === "pending").reduce((acc, l) => acc + l.hours, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Audit Company Timesheets</h1>
        <p className="text-gray-500 text-sm mt-1">Audit, modify, and review work hours logs company-wide</p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Total Logged Hours</span>
          <span className="text-3xl font-black text-gray-955 mt-2 font-mono">{totalHours} hrs</span>
        </div>
        <div className="bg-emerald-50/20 p-5 rounded-2xl border border-emerald-100 shadow-sm flex flex-col justify-between">
          <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider font-extrabold">Approved Hours</span>
          <span className="text-3xl font-black text-emerald-700 mt-2 font-mono">{approvedHours} hrs</span>
        </div>
        <div className="bg-amber-50/20 p-5 rounded-2xl border border-amber-100 shadow-sm flex flex-col justify-between">
          <span className="text-[10px] text-amber-600 font-bold uppercase tracking-wider font-extrabold font-mono">Pending Review</span>
          <span className="text-3xl font-black text-amber-700 mt-2 font-mono">{pendingHours} hrs</span>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search by employee name, project, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50/50 border border-gray-200 rounded-xl pl-10 pr-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto">
          <span className="text-xs text-gray-400 font-bold uppercase mr-1 whitespace-nowrap">Filter Status:</span>
          {[
            { id: "all", label: "All Logs" },
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

      {/* Roster Table */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
        {filteredLogs.length === 0 ? (
          <div className="p-16 text-center text-gray-400 flex flex-col items-center justify-center gap-3">
            <FolderOpen className="w-10 h-10 text-gray-300" />
            <h3 className="font-extrabold text-gray-900 text-sm">No timesheets match this query</h3>
            <p className="text-xs text-gray-400">No logs reported matching the filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left p-4 font-semibold text-gray-600">Employee Details</th>
                  <th className="text-left p-4 font-semibold text-gray-600">Work Date</th>
                  <th className="text-left p-4 font-semibold text-gray-600">Project</th>
                  <th className="text-left p-4 font-semibold text-gray-600">Hours</th>
                  <th className="text-left p-4 font-semibold text-gray-600">Description</th>
                  <th className="text-left p-4 font-semibold text-gray-600">Status</th>
                  <th className="text-center p-4 font-semibold text-gray-600">Audit Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredLogs.map((log) => {
                  const isRejected = log.status === "rejected";

                  return (
                    <tr key={log._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 font-medium text-gray-900 flex items-center gap-2">
                        <div className="w-8 h-8 bg-indigo-50 border border-indigo-150 text-indigo-750 text-[10px] font-black rounded-lg flex items-center justify-center">
                          {log.userId?.name ? log.userId.name.split(" ").map(n => n[0]).slice(0,2).join("").toUpperCase() : "??"}
                        </div>
                        <div>
                          <p className="font-bold text-gray-955 leading-none">{log.userId?.name || "Unknown User"}</p>
                          <span className="text-[9px] text-gray-400 leading-none block mt-0.5">{log.userId?.email}</span>
                        </div>
                      </td>
                      <td className="p-4 font-mono text-xs">
                        {new Date(log.date).toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' })}
                      </td>
                      <td className="p-4">
                        <span className="font-extrabold text-indigo-700 bg-indigo-50 border border-indigo-100 rounded-lg px-2.5 py-1 text-xs">
                          {log.project}
                        </span>
                      </td>
                      <td className="p-4 font-mono font-bold text-gray-955 text-sm">
                        {log.hours} hrs
                      </td>
                      <td className="p-4 text-gray-500 max-w-xs truncate" title={log.description}>
                        {log.description || "—"}
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col gap-0.5">
                          <span className={`inline-flex items-center gap-1 text-xs font-black uppercase tracking-wider ${
                            log.status === "approved" 
                              ? "text-emerald-700" 
                              : log.status === "rejected" 
                              ? "text-rose-700" 
                              : "text-slate-500"
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              log.status === "approved" 
                                ? "bg-emerald-500" 
                                : log.status === "rejected" 
                                ? "bg-rose-500" 
                                : "bg-slate-400"
                            }`} />
                            {log.status}
                          </span>
                          {isRejected && log.rejectionReason && (
                            <span className="text-[10px] text-rose-500 font-bold block max-w-[150px] truncate" title={log.rejectionReason}>
                              Reason: {log.rejectionReason}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleOpenEditModal(log)}
                            className="p-1.5 text-gray-400 hover:text-indigo-650 hover:bg-slate-50 border border-transparent hover:border-gray-150 rounded-xl transition-all cursor-pointer"
                            title="Edit / Audit Entry"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteLog(log._id)}
                            className="p-1.5 text-gray-400 hover:text-rose-655 hover:bg-rose-50/50 border border-transparent hover:border-rose-100 rounded-xl transition-all cursor-pointer"
                            title="Delete Entry"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
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

      {/* Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            onClick={handleCloseModal}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
          />

          <div className="bg-white rounded-3xl shadow-2xl border border-gray-150 w-full max-w-md p-6 relative z-10 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
              <h3 className="text-lg font-black text-gray-900">
                Audit Timesheet Entry
              </h3>
              <button 
                onClick={handleCloseModal}
                className="p-1.5 hover:bg-slate-100 text-gray-400 hover:text-gray-650 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="mb-4 p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4.5 h-4.5 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Date */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Work Date</label>
                  <input 
                    type="date"
                    value={modalForm.date}
                    onChange={(e) => setModalForm({...modalForm, date: e.target.value})}
                    className="w-full border border-gray-250 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
                    required
                  />
                </div>

                {/* Hours */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Hours Worked</label>
                  <input 
                    type="number"
                    min="1"
                    max="24"
                    value={modalForm.hours}
                    onChange={(e) => setModalForm({...modalForm, hours: parseInt(e.target.value) || 0})}
                    className="w-full border border-gray-250 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    required
                  />
                </div>
              </div>

              {/* Project */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Project / Code</label>
                <input 
                  type="text"
                  placeholder="e.g. HRMS Project"
                  value={modalForm.project}
                  onChange={(e) => setModalForm({...modalForm, project: e.target.value})}
                  className="w-full border border-gray-250 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Status */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Status Override</label>
                  <select
                    value={modalForm.status}
                    onChange={(e) => setModalForm({...modalForm, status: e.target.value})}
                    className="w-full border border-gray-250 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
                  >
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>

                {/* Rejection Reason (only editable if status is rejected) */}
                {modalForm.status === "rejected" && (
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Audit Feedback</label>
                    <input 
                      type="text"
                      placeholder="Comment for reject..."
                      value={modalForm.rejectionReason}
                      onChange={(e) => setModalForm({...modalForm, rejectionReason: e.target.value})}
                      className="w-full border border-gray-250 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Activity Description</label>
                <textarea 
                  placeholder="Describe employee work deliverables..."
                  value={modalForm.description}
                  onChange={(e) => setModalForm({...modalForm, description: e.target.value})}
                  className="w-full border border-gray-250 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none min-h-[80px]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 mt-6">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-bold hover:bg-slate-50 active:scale-[0.98] transition-all cursor-pointer text-xs"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md shadow-indigo-500/10 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 cursor-pointer text-xs disabled:opacity-75"
                >
                  {actionLoading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                  <span>Save Adjustments</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTimesheets;
