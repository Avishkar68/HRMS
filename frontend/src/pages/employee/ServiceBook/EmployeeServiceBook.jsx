import React, { useEffect, useState } from "react";
import api from "../../../utils/api";
import { 
  BookOpen, 
  Briefcase, 
  TrendingUp, 
  RefreshCw, 
  DollarSign, 
  Calendar, 
  Award, 
  AlertTriangle, 
  LogOut, 
  FileText,
  Clock,
  Eye,
  X,
  FileCheck
} from "lucide-react";

const EmployeeServiceBook = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const fetchServiceBook = async () => {
    try {
      const res = await api.get("/service-book");
      setEntries(res.data || []);
    } catch (err) {
      console.error("Error fetching service book:", err);
    }
  };

  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      await fetchServiceBook();
      setLoading(false);
    };
    initData();
  }, []);

  const handleOpenModal = (entry) => {
    setSelectedEntry(entry);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setSelectedEntry(null);
    setShowModal(false);
  };

  const getEventStyle = (type) => {
    switch (type) {
      case "Appointment":
        return { bg: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: Briefcase, color: "emerald" };
      case "Promotion":
        return { bg: "bg-indigo-50 text-indigo-700 border-indigo-200", icon: TrendingUp, color: "indigo" };
      case "Transfer":
        return { bg: "bg-sky-50 text-sky-700 border-sky-200", icon: RefreshCw, color: "sky" };
      case "Increment":
        return { bg: "bg-amber-50 text-amber-700 border-amber-200", icon: DollarSign, color: "amber" };
      case "Leave":
        return { bg: "bg-purple-50 text-purple-700 border-purple-200", icon: Calendar, color: "purple" };
      case "Award":
        return { bg: "bg-rose-50 text-rose-700 border-rose-200", icon: Award, color: "rose" };
      case "Disciplinary":
        return { bg: "bg-red-50 text-red-700 border-red-200", icon: AlertTriangle, color: "red" };
      case "Separation":
        return { bg: "bg-slate-50 text-slate-700 border-slate-200", icon: LogOut, color: "slate" };
      default:
        return { bg: "bg-gray-50 text-gray-700 border-gray-200", icon: FileText, color: "gray" };
    }
  };

  // Get current status summary
  const totalRecords = entries.length;
  const currentDesignation = entries[0]?.designation || "Initial Appointee";
  const currentDepartment = entries[0]?.department || "General Operations";
  const dateOfJoining = entries[entries.length - 1]?.eventDate 
    ? new Date(entries[entries.length - 1].eventDate).toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' })
    : "—";

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
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">My Service Book</h1>
        <p className="text-gray-500 text-sm mt-1">View your complete chronological service record, career events, and official orders</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Current Position</span>
          <span className="text-lg font-black text-slate-900 mt-2 truncate" title={currentDesignation}>{currentDesignation}</span>
          <span className="text-[10px] text-indigo-600 font-bold mt-0.5">{currentDepartment}</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Date of Joining</span>
          <span className="text-lg font-black text-slate-900 mt-2">{dateOfJoining}</span>
          <span className="text-[10px] text-emerald-600 font-bold mt-0.5">Established Record</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Total Records Logged</span>
          <span className="text-lg font-black text-slate-900 mt-2 font-mono">{totalRecords} Entries</span>
          <span className="text-[10px] text-gray-400 font-bold mt-0.5">Verified service logs</span>
        </div>
      </div>

      {/* Career Timeline */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 relative min-h-[300px]">
        {entries.length === 0 ? (
          <div className="p-16 text-center text-gray-400 flex flex-col items-center justify-center gap-3">
            <BookOpen className="w-12 h-12 text-gray-300" />
            <h3 className="font-extrabold text-gray-900 text-sm">No service record registered</h3>
            <p className="text-xs text-gray-400">Once HR logs your initial appointment or promotions, they will appear here as a career timeline.</p>
          </div>
        ) : (
          <div className="relative pl-6 sm:pl-10 space-y-8">
            {/* Timeline center line */}
            <div className="absolute left-[34px] sm:left-[50px] top-4 bottom-4 w-[2px] bg-slate-100" />

            {entries.map((entry, idx) => {
              const style = getEventStyle(entry.eventType);
              const EventIcon = style.icon;
              const formattedDate = new Date(entry.eventDate).toLocaleDateString("en-US", {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              });

              return (
                <div key={entry._id} className="relative flex items-start gap-4 sm:gap-6 group">
                  {/* Timeline Badge */}
                  <div className={`w-9 h-9 rounded-xl border flex items-center justify-center relative z-10 transition-transform group-hover:scale-105 shadow-sm ${style.bg}`}>
                    <EventIcon className="w-4.5 h-4.5" />
                  </div>

                  {/* Content Card */}
                  <div className="flex-1 bg-slate-50/50 hover:bg-slate-50 border border-slate-150/75 rounded-2xl p-4 sm:p-5 transition-all shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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

                    <button 
                      onClick={() => handleOpenModal(entry)}
                      className="inline-flex items-center justify-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-white hover:bg-indigo-50/50 border border-gray-200 px-3 py-2 rounded-xl transition-all active:scale-[0.98] cursor-pointer self-start sm:self-auto shrink-0 shadow-sm"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Details</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Details View Modal */}
      {showModal && selectedEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={handleCloseModal} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-150 w-full max-w-lg p-6 relative z-10 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
              <div>
                <h3 className="text-lg font-black text-gray-900">Official Service Record</h3>
                <p className="text-xs text-gray-400 mt-0.5">Logged on: {new Date(selectedEntry.createdAt).toLocaleDateString()}</p>
              </div>
              <button onClick={handleCloseModal} className="p-1.5 hover:bg-slate-100 text-gray-400 hover:text-gray-650 rounded-xl transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Event Type Header */}
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
                  <span className="text-[10px] text-gray-400 font-bold uppercase">Corporate Department</span>
                  <span className="text-xs font-bold text-gray-800 block">{selectedEntry.department}</span>
                </div>
              </div>

              {/* Salary details segment */}
              <div className="bg-white border border-gray-200 rounded-2xl p-4 space-y-1">
                <span className="text-[10px] text-indigo-600 font-extrabold uppercase tracking-wider block">Salary Scale & Allowance Details</span>
                <p className="text-gray-850 text-xs whitespace-pre-wrap font-semibold leading-relaxed">
                  {selectedEntry.salaryDetails || "No modifications to pay structure logged."}
                </p>
              </div>

              {/* Remarks and verification details */}
              <div className="bg-slate-50 border border-gray-150 rounded-2xl p-4 space-y-3">
                <div className="space-y-1">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Official Remarks</span>
                  <p className="text-gray-800 text-xs italic whitespace-pre-wrap font-semibold leading-relaxed">
                    {selectedEntry.remarks ? `"${selectedEntry.remarks}"` : "No official comments provided."}
                  </p>
                </div>
                
                <div className="pt-3 border-t border-gray-200 flex items-center justify-between text-[10px] text-gray-400">
                  <span>Authorized Witness: <strong>{selectedEntry.recordedBy?.name || "HR System Administrator"}</strong></span>
                  <span className="flex items-center gap-1 text-emerald-700 font-bold uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                    <FileCheck className="w-3 h-3" />
                    Verified Entry
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  onClick={handleCloseModal}
                  className="px-6 py-2.5 rounded-xl bg-gray-900 text-white font-bold hover:bg-slate-950 transition-all cursor-pointer text-xs"
                >
                  Close Record
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeServiceBook;
