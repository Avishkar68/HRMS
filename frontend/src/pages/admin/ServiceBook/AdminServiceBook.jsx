import React, { useEffect, useState } from "react";
import api from "../../../utils/api";
import { 
  Plus, 
  Search, 
  Trash2, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  X,
  BookOpen,
  Award,
  Star,
  Eye,
  Briefcase,
  TrendingUp,
  RefreshCw,
  DollarSign,
  Calendar,
  AlertTriangle,
  LogOut,
  FileText,
  FileCheck,
  Edit3
} from "lucide-react";

const AdminServiceBook = () => {
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [entriesLoading, setEntriesLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  
  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Form states
  const [modalForm, setModalForm] = useState({
    eventType: "Appointment",
    eventDate: "",
    designation: "",
    department: "",
    salaryDetails: "",
    officeOrderNumber: "",
    remarks: ""
  });
  const [errorMsg, setErrorMsg] = useState("");

  const fetchUsers = async () => {
    try {
      const res = await api.get("/admin/users");
      setUsers(res.data || []);
      if (res.data && res.data.length > 0) {
        setSelectedUserId(res.data[0]._id);
      }
    } catch (err) {
      console.error("Error loading employees roster:", err);
    }
  };

  const fetchUserServiceBook = async (userId) => {
    if (!userId) return;
    setEntriesLoading(true);
    try {
      const res = await api.get(`/service-book?employeeId=${userId}`);
      setEntries(res.data || []);
    } catch (err) {
      console.error("Error fetching service book records:", err);
    } finally {
      setEntriesLoading(false);
    }
  };

  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      await fetchUsers();
      setLoading(false);
    };
    initData();
  }, []);

  useEffect(() => {
    if (selectedUserId) {
      fetchUserServiceBook(selectedUserId);
    } else {
      setEntries([]);
    }
  }, [selectedUserId]);

  const handleOpenCreateModal = () => {
    setErrorMsg("");
    setIsEditing(false);
    setSelectedEntry(null);
    const latest = entries[0];
    setModalForm({
      eventType: "Appointment",
      eventDate: new Date().toISOString().split("T")[0],
      designation: latest ? latest.designation : "",
      department: latest ? latest.department : "General Operations",
      salaryDetails: latest ? latest.salaryDetails : "",
      officeOrderNumber: "",
      remarks: ""
    });
    setShowCreateModal(true);
  };

  const handleOpenEditModal = (entry) => {
    setErrorMsg("");
    setIsEditing(true);
    setSelectedEntry(entry);
    setModalForm({
      eventType: entry.eventType,
      eventDate: entry.eventDate ? new Date(entry.eventDate).toISOString().split("T")[0] : "",
      designation: entry.designation,
      department: entry.department,
      salaryDetails: entry.salaryDetails || "",
      officeOrderNumber: entry.officeOrderNumber,
      remarks: entry.remarks || ""
    });
    setShowCreateModal(true);
  };

  const handleOpenViewModal = (entry) => {
    setSelectedEntry(entry);
    setShowViewModal(true);
  };

  const handleCloseModals = () => {
    setShowCreateModal(false);
    setShowViewModal(false);
    setSelectedEntry(null);
    setErrorMsg("");
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!selectedUserId) {
      setErrorMsg("Please select an employee first.");
      return;
    }

    setActionLoading(true);
    try {
      if (isEditing && selectedEntry) {
        // Edit entry
        const res = await api.put(`/service-book/${selectedEntry._id}`, modalForm);
        setEntries(entries.map(e => e._id === selectedEntry._id ? res.data : e));
      } else {
        // Create entry
        const res = await api.post("/service-book", {
          ...modalForm,
          userId: selectedUserId
        });
        setEntries([res.data, ...entries]);
      }
      handleCloseModals();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Failed to save service record entry.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteEntry = async (id) => {
    if (!window.confirm("WARNING: Are you sure you want to permanently delete this service record? This action cannot be undone.")) return;

    try {
      await api.delete(`/service-book/${id}`);
      setEntries(entries.filter(e => e._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete entry.");
    }
  };

  const getEventStyle = (type) => {
    switch (type) {
      case "Appointment":
        return { bg: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: Briefcase };
      case "Promotion":
        return { bg: "bg-indigo-50 text-indigo-700 border-indigo-200", icon: TrendingUp };
      case "Transfer":
        return { bg: "bg-sky-50 text-sky-700 border-sky-200", icon: RefreshCw };
      case "Increment":
        return { bg: "bg-amber-50 text-amber-700 border-amber-200", icon: DollarSign };
      case "Leave":
        return { bg: "bg-purple-50 text-purple-700 border-purple-200", icon: Calendar };
      case "Award":
        return { bg: "bg-rose-50 text-rose-700 border-rose-200", icon: Award };
      case "Disciplinary":
        return { bg: "bg-red-50 text-red-700 border-red-200", icon: AlertTriangle };
      case "Separation":
        return { bg: "bg-slate-50 text-slate-700 border-slate-200", icon: LogOut };
      default:
        return { bg: "bg-gray-50 text-gray-700 border-gray-200", icon: FileText };
    }
  };

  const currentUser = users.find(u => u._id === selectedUserId);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Service Book Manager</h1>
          <p className="text-gray-500 text-sm mt-1">Audit, register, and update career histories for all enterprise users</p>
        </div>
        
        {selectedUserId && (
          <button 
            onClick={handleOpenCreateModal}
            className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-2xl font-bold transition-all active:scale-[0.98] shadow-md shadow-indigo-600/10 cursor-pointer text-sm"
          >
            <Plus className="w-4.5 h-4.5" />
            <span>Add Service Record</span>
          </button>
        )}
      </div>

      {/* User selector bar */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 flex flex-col sm:flex-row items-center gap-4">
        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">Select Employee Directory:</label>
        <select
          value={selectedUserId}
          onChange={(e) => setSelectedUserId(e.target.value)}
          className="flex-1 bg-slate-50/50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
        >
          <option value="">-- Choose User --</option>
          {users.map(u => (
            <option key={u._id} value={u._id}>{u.name} ({u.role} - {u.email})</option>
          ))}
        </select>
      </div>

      {/* Main Timeline details */}
      {selectedUserId ? (
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 relative">
          <div className="border-b border-gray-100 pb-4 mb-6 flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-gray-900 text-base">Administrative Audit Trail</h3>
              <p className="text-xs text-gray-400">Chronological list of career events for {currentUser?.name}</p>
            </div>
            <span className="text-xs font-mono font-bold text-gray-450 bg-slate-50 border border-slate-150 px-2.5 py-1 rounded-lg">
              {entries.length} records found
            </span>
          </div>

          {entriesLoading ? (
            <div className="py-16 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-600 border-t-transparent" />
            </div>
          ) : entries.length === 0 ? (
            <div className="p-16 text-center text-gray-400 flex flex-col items-center justify-center gap-3">
              <BookOpen className="w-10 h-10 text-gray-300" />
              <h4 className="font-extrabold text-gray-900 text-sm">No records logged for this employee</h4>
              <p className="text-xs text-gray-400">Click "Add Service Record" above to document their appointment, promotions, or transfers.</p>
            </div>
          ) : (
            <div className="relative pl-6 sm:pl-10 space-y-8">
              {/* Timeline center line */}
              <div className="absolute left-[34px] sm:left-[50px] top-4 bottom-4 w-[2px] bg-slate-100" />

              {entries.map((entry) => {
                const style = getEventStyle(entry.eventType);
                const EventIcon = style.icon;
                const formattedDate = new Date(entry.eventDate).toLocaleDateString("en-US", {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                });

                return (
                  <div key={entry._id} className="relative flex items-start gap-4 sm:gap-6 group">
                    {/* Badge Icon */}
                    <div className={`w-9 h-9 rounded-xl border flex items-center justify-center relative z-10 transition-transform group-hover:scale-105 shadow-sm ${style.bg}`}>
                      <EventIcon className="w-4.5 h-4.5" />
                    </div>

                    {/* Content Card */}
                    <div className="flex-1 bg-slate-50/50 border border-slate-150/75 rounded-2xl p-4 sm:p-5 transition-all shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1.5 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-mono font-bold text-gray-450">{formattedDate}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border ${style.bg}`}>
                            {entry.eventType}
                          </span>
                        </div>
                        <h4 className="font-extrabold text-gray-900 text-base leading-tight">
                          {entry.designation}
                        </h4>
                        <p className="text-xs text-gray-500 font-semibold flex items-center gap-1.5">
                          <span>Department: <strong className="text-gray-700 font-bold">{entry.department}</strong></span>
                          <span className="text-gray-300">•</span>
                          <span>Order Ref: <strong className="font-mono text-gray-700">{entry.officeOrderNumber}</strong></span>
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button 
                          onClick={() => handleOpenViewModal(entry)}
                          className="p-2 text-gray-450 hover:text-indigo-650 hover:bg-white border border-transparent hover:border-gray-200 rounded-xl transition-all cursor-pointer shadow-sm"
                          title="View Entry details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleOpenEditModal(entry)}
                          className="p-2 text-gray-450 hover:text-indigo-650 hover:bg-white border border-transparent hover:border-gray-200 rounded-xl transition-all cursor-pointer shadow-sm"
                          title="Modify Entry parameters"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteEntry(entry._id)}
                          className="p-2 text-gray-450 hover:text-rose-650 hover:bg-rose-50/50 border border-transparent hover:border-rose-100 rounded-xl transition-all cursor-pointer"
                          title="Admin Permanent Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-16 text-center text-gray-450 flex flex-col items-center justify-center gap-3">
          <BookOpen className="w-12 h-12 text-gray-300" />
          <h3 className="font-extrabold text-gray-900 text-sm">Select a user to view history</h3>
          <p className="text-xs text-gray-400">Choose one of your active enterprise directory users to audit or log service milestones.</p>
        </div>
      )}

      {/* Log / Edit Service Book Entry Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={handleCloseModals} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-150 w-full max-w-lg p-6 relative z-10 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
              <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-655" />
                {isEditing ? "Edit Service Record Details" : "Add Service Record Entry"}
              </h3>
              <button onClick={handleCloseModals} className="p-1.5 hover:bg-slate-100 text-gray-400 hover:text-gray-650 rounded-xl transition-colors cursor-pointer">
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
              {/* Event Type & Event Date */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Event Type</label>
                  <select
                    value={modalForm.eventType}
                    onChange={(e) => setModalForm({...modalForm, eventType: e.target.value})}
                    className="w-full border border-gray-250 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
                    required
                  >
                    <option value="Appointment">Appointment</option>
                    <option value="Promotion">Promotion</option>
                    <option value="Transfer">Transfer</option>
                    <option value="Increment">Salary Increment</option>
                    <option value="Leave">Leave (Long Term)</option>
                    <option value="Award">Award</option>
                    <option value="Disciplinary">Disciplinary Action</option>
                    <option value="Separation">Separation</option>
                    <option value="Other">Other Event</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Effective Event Date</label>
                  <input 
                    type="date"
                    value={modalForm.eventDate}
                    onChange={(e) => setModalForm({...modalForm, eventDate: e.target.value})}
                    className="w-full border border-gray-250 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
                    required
                  />
                </div>
              </div>

              {/* Designation & Department */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Designation / Title</label>
                  <input 
                    type="text"
                    placeholder="e.g. Senior Software Engineer"
                    value={modalForm.designation}
                    onChange={(e) => setModalForm({...modalForm, designation: e.target.value})}
                    className="w-full border border-gray-250 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Department</label>
                  <input 
                    type="text"
                    placeholder="e.g. Engineering"
                    value={modalForm.department}
                    onChange={(e) => setModalForm({...modalForm, department: e.target.value})}
                    className="w-full border border-gray-250 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    required
                  />
                </div>
              </div>

              {/* Office Order Number */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Office Order Reference #</label>
                <input 
                  type="text"
                  placeholder="e.g. HR/2026/PRO-094"
                  value={modalForm.officeOrderNumber}
                  onChange={(e) => setModalForm({...modalForm, officeOrderNumber: e.target.value})}
                  className="w-full border border-gray-250 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  required
                />
              </div>

              {/* Salary Details */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Salary Structure details</label>
                <textarea 
                  rows={2}
                  placeholder="e.g. Basic: $6,500/mo, Allowances: $500. Grade Level E4."
                  value={modalForm.salaryDetails}
                  onChange={(e) => setModalForm({...modalForm, salaryDetails: e.target.value})}
                  className="w-full border border-gray-250 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none min-h-[50px] max-h-[100px]"
                />
              </div>

              {/* Remarks */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Additional Remarks / Rationale</label>
                <textarea 
                  rows={3}
                  placeholder="Provide supporting details or background context regarding this service action..."
                  value={modalForm.remarks}
                  onChange={(e) => setModalForm({...modalForm, remarks: e.target.value})}
                  className="w-full border border-gray-250 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none min-h-[70px]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 mt-6">
                <button
                  type="button"
                  onClick={handleCloseModals}
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
                  <span>{isEditing ? "Save Changes" : "Save Service Entry"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {showViewModal && selectedEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={handleCloseModals} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-150 w-full max-w-lg p-6 relative z-10 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
              <div>
                <h3 className="text-lg font-black text-gray-900">Career Milestone Summary</h3>
                <p className="text-xs text-gray-400 mt-0.5">Cycle: {new Date(selectedEntry.createdAt).toLocaleDateString()}</p>
              </div>
              <button onClick={handleCloseModals} className="p-1.5 hover:bg-slate-100 text-gray-400 hover:text-gray-650 rounded-xl transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Event type header */}
              <div className="flex items-center gap-3 p-4 bg-slate-50 border border-gray-150 rounded-2xl">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${getEventStyle(selectedEntry.eventType).bg}`}>
                  {React.createElement(getEventStyle(selectedEntry.eventType).icon, { className: "w-5 h-5" })}
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Event Classification</span>
                  <span className="text-sm font-black text-gray-900 uppercase tracking-wide">{selectedEntry.eventType}</span>
                </div>
              </div>

              {/* Core Details Grid */}
              <div className="bg-white border border-gray-200 rounded-2xl p-4 grid grid-cols-2 gap-4">
                <div className="space-y-0.5">
                  <span className="text-[10px] text-gray-400 font-bold uppercase">Effective Date</span>
                  <span className="text-xs font-bold text-gray-800 block">
                    {new Date(selectedEntry.eventDate).toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] text-gray-400 font-bold uppercase">Office Order Reference</span>
                  <span className="text-xs font-mono font-bold text-indigo-700 block">{selectedEntry.officeOrderNumber}</span>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] text-gray-400 font-bold uppercase">Designation / Title</span>
                  <span className="text-xs font-bold text-gray-800 block">{selectedEntry.designation}</span>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] text-gray-400 font-bold uppercase">Department</span>
                  <span className="text-xs font-bold text-gray-800 block">{selectedEntry.department}</span>
                </div>
              </div>

              {/* Salary details */}
              <div className="bg-white border border-gray-200 rounded-2xl p-4 space-y-1">
                <span className="text-[10px] text-indigo-650 font-extrabold uppercase tracking-wider block">Salary Scale & Allowances</span>
                <p className="text-gray-850 text-xs whitespace-pre-wrap font-semibold leading-relaxed">
                  {selectedEntry.salaryDetails || "No salary parameters modified in this event."}
                </p>
              </div>

              {/* Remarks and metadata */}
              <div className="bg-slate-50 border border-gray-150 rounded-2xl p-4 space-y-3">
                <div className="space-y-1">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Official Comments</span>
                  <p className="text-gray-800 text-xs italic whitespace-pre-wrap font-semibold leading-relaxed">
                    {selectedEntry.remarks ? `"${selectedEntry.remarks}"` : "No remarks provided."}
                  </p>
                </div>
                
                <div className="pt-3 border-t border-gray-200 flex items-center justify-between text-[10px] text-gray-400">
                  <span>Recorded Witness: <strong>{selectedEntry.recordedBy?.name}</strong></span>
                  <span className="flex items-center gap-1 text-emerald-700 font-bold uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                    <FileCheck className="w-3 h-3" />
                    Verified Entry
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  onClick={handleCloseModals}
                  className="px-6 py-2.5 rounded-xl bg-gray-900 text-white font-bold hover:bg-slate-950 transition-all cursor-pointer text-xs"
                >
                  Close Document
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminServiceBook;
