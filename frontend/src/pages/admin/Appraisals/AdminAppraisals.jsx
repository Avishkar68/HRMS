import React, { useEffect, useState } from "react";
import api from "../../../utils/api";
import { 
  Award, 
  Star, 
  Trash2, 
  Search, 
  Eye, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  X,
  ShieldCheck
} from "lucide-react";

const AdminAppraisals = () => {
  const [appraisals, setAppraisals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  
  // Search/Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Modal view
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedAppraisal, setSelectedAppraisal] = useState(null);

  const fetchAppraisals = async () => {
    try {
      const res = await api.get("/appraisals");
      setAppraisals(res.data || []);
    } catch (err) {
      console.error("Error loading appraisals:", err);
    }
  };

  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      await fetchAppraisals();
      setLoading(false);
    };
    initData();
  }, []);

  const handleOpenViewModal = (appraisal) => {
    setSelectedAppraisal(appraisal);
    setShowViewModal(true);
  };

  const handleCloseViewModal = () => {
    setSelectedAppraisal(null);
    setShowViewModal(false);
  };

  const handleDeleteAppraisal = async (id) => {
    if (!window.confirm("WARNING: Are you sure you want to permanently delete this performance review? This is an administrative delete override and cannot be undone.")) return;

    try {
      await api.delete(`/appraisals/${id}`);
      setAppraisals(appraisals.filter(a => a._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete appraisal record.");
    }
  };

  const calculateAverage = (appraisal) => {
    if (!appraisal || !appraisal.ratings) return 0;
    const { performance, communication, teamwork, punctuality } = appraisal.ratings;
    return ((performance + communication + teamwork + punctuality) / 4).toFixed(1);
  };

  const getMetricAverage = (metricKey) => {
    if (appraisals.length === 0) return "0.0";
    const total = appraisals.reduce((acc, curr) => acc + (curr.ratings?.[metricKey] || 0), 0);
    return (total / appraisals.length).toFixed(1);
  };

  const getGlobalAverage = () => {
    if (appraisals.length === 0) return "0.0";
    const total = appraisals.reduce((acc, curr) => acc + parseFloat(calculateAverage(curr)), 0);
    return (total / appraisals.length).toFixed(1);
  };

  const filteredAppraisals = appraisals.filter((a) => {
    const empName = a.userId?.name || "";
    const managerName = a.managerId?.name || "";
    const period = a.period || "";
    const matchesSearch = 
      empName.toLowerCase().includes(searchQuery.toLowerCase()) || 
      managerName.toLowerCase().includes(searchQuery.toLowerCase()) || 
      period.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || a.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-3.5 h-3.5 ${
              star <= rating ? "text-amber-400 fill-amber-400" : "text-gray-200"
            }`}
          />
        ))}
      </div>
    );
  };

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
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Enterprise Appraisals</h1>
        <p className="text-gray-500 text-sm mt-1">Audit company-wide performance ratings, metrics, and cycles</p>
      </div>

      {/* Stats and Distributions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Stats Card */}
        <div className="bg-gradient-to-br from-indigo-900 to-indigo-950 p-6 rounded-3xl text-white shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-indigo-200 font-extrabold uppercase tracking-wider">Global Average Rating</span>
              <ShieldCheck className="w-5 h-5 text-indigo-300" />
            </div>
            <h2 className="text-4xl font-black mt-2 font-mono">{getGlobalAverage()} / 5.0</h2>
            <p className="text-xs text-indigo-200/70 mt-1">Aggregated score based on {appraisals.length} active review records</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-indigo-800">
            <div>
              <span className="text-[9px] text-indigo-300 font-bold uppercase tracking-wider block">Completed Reviews</span>
              <span className="text-xl font-bold font-mono">{appraisals.filter(a => a.status === "completed").length}</span>
            </div>
            <div>
              <span className="text-[9px] text-indigo-300 font-bold uppercase tracking-wider block">Pending Employee Response</span>
              <span className="text-xl font-bold font-mono">{appraisals.filter(a => a.status === "pending-employee-feedback").length}</span>
            </div>
          </div>
        </div>

        {/* Ratings Metrics breakdown */}
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm lg:col-span-2 space-y-4">
          <h3 className="text-xs font-extrabold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-indigo-650" />
            Average Scores by Appraisal Metric
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Performance */}
            <div className="p-3 bg-slate-50 border border-gray-150 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-xs text-gray-500 font-bold">Performance Ratings</span>
                <span className="text-lg font-black text-gray-900 block font-mono mt-0.5">{getMetricAverage("performance")} / 5.0</span>
              </div>
              {renderStars(Math.round(getMetricAverage("performance")))}
            </div>

            {/* Communication */}
            <div className="p-3 bg-slate-50 border border-gray-150 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-xs text-gray-500 font-bold">Communication & Alignment</span>
                <span className="text-lg font-black text-gray-900 block font-mono mt-0.5">{getMetricAverage("communication")} / 5.0</span>
              </div>
              {renderStars(Math.round(getMetricAverage("communication")))}
            </div>

            {/* Teamwork */}
            <div className="p-3 bg-slate-50 border border-gray-150 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-xs text-gray-500 font-bold">Collaboration & Teamwork</span>
                <span className="text-lg font-black text-gray-900 block font-mono mt-0.5">{getMetricAverage("teamwork")} / 5.0</span>
              </div>
              {renderStars(Math.round(getMetricAverage("teamwork")))}
            </div>

            {/* Punctuality */}
            <div className="p-3 bg-slate-50 border border-gray-150 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-xs text-gray-500 font-bold">Attendance & Punctuality</span>
                <span className="text-lg font-black text-gray-900 block font-mono mt-0.5">{getMetricAverage("punctuality")} / 5.0</span>
              </div>
              {renderStars(Math.round(getMetricAverage("punctuality")))}
            </div>
          </div>
        </div>
      </div>

      {/* Roster Controls */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search by employee name, manager name, or period..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50/50 border border-gray-200 rounded-xl pl-10 pr-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto">
          <span className="text-xs text-gray-400 font-bold uppercase mr-1 whitespace-nowrap">Status:</span>
          {[
            { id: "all", label: "All Reviews" },
            { id: "pending-employee-feedback", label: "Pending Self-Eval" },
            { id: "completed", label: "Completed" }
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

      {/* Roster Logs */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
        {filteredAppraisals.length === 0 ? (
          <div className="p-16 text-center text-gray-400 flex flex-col items-center justify-center gap-3">
            <Award className="w-10 h-10 text-gray-300" />
            <h3 className="font-extrabold text-gray-900 text-sm">No appraisals archived</h3>
            <p className="text-xs text-gray-400">All company performance reviews will appear here once initiated.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left p-4 font-semibold text-gray-600">Employee</th>
                  <th className="text-left p-4 font-semibold text-gray-600">Reviewed By</th>
                  <th className="text-left p-4 font-semibold text-gray-600">Period</th>
                  <th className="text-left p-4 font-semibold text-gray-600">Avg Rating</th>
                  <th className="text-left p-4 font-semibold text-gray-600">Status</th>
                  <th className="text-center p-4 font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredAppraisals.map((appraisal) => {
                  const isPending = appraisal.status === "pending-employee-feedback";
                  const avgScore = calculateAverage(appraisal);
                  const employeeName = appraisal.userId?.name || "Deleted Employee";
                  const reviewerName = appraisal.managerId?.name || "Manager";

                  return (
                    <tr key={appraisal._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 font-extrabold text-slate-900">
                        {employeeName}
                      </td>
                      <td className="p-4 font-medium text-gray-650">
                        {reviewerName}
                      </td>
                      <td className="p-4 font-bold text-indigo-700">
                        {appraisal.period}
                      </td>
                      <td className="p-4 font-mono font-bold text-gray-950 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="bg-slate-100 border border-gray-200 px-2 py-0.5 rounded text-xs font-mono">
                            {avgScore}
                          </span>
                          {renderStars(Math.round(avgScore))}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1 text-xs font-black uppercase tracking-wider ${
                          isPending ? "text-amber-700" : "text-emerald-700"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            isPending ? "bg-amber-500" : "bg-emerald-500"
                          }`} />
                          {isPending ? "Awaiting Employee" : "Completed"}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleOpenViewModal(appraisal)}
                            className="p-1.5 text-gray-450 hover:text-indigo-650 hover:bg-slate-50 border border-transparent hover:border-gray-150 rounded-xl transition-all cursor-pointer"
                            title="View Appraisal"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteAppraisal(appraisal._id)}
                            className="p-1.5 text-gray-450 hover:text-rose-650 hover:bg-rose-50/50 border border-transparent hover:border-rose-100 rounded-xl transition-all cursor-pointer"
                            title="Admin Delete Override"
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

      {/* View Modal */}
      {showViewModal && selectedAppraisal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={handleCloseViewModal} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-150 w-full max-w-lg p-6 relative z-10 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
              <div>
                <h3 className="text-lg font-black text-gray-900">Administrative Audit Report</h3>
                <p className="text-xs text-gray-400 mt-0.5">Cycle: {selectedAppraisal.period}</p>
              </div>
              <button onClick={handleCloseViewModal} className="p-1.5 hover:bg-slate-100 text-gray-400 hover:text-gray-650 rounded-xl transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Personnel detail */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 border border-gray-150 rounded-2xl p-3">
                  <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block">Evaluated Employee</span>
                  <span className="text-xs font-black text-gray-900 block mt-1">{selectedAppraisal.userId?.name}</span>
                  <span className="text-[9px] text-gray-400 font-bold block">{selectedAppraisal.userId?.email}</span>
                </div>
                <div className="bg-slate-50 border border-gray-150 rounded-2xl p-3">
                  <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block">Evaluating Manager</span>
                  <span className="text-xs font-black text-gray-900 block mt-1">{selectedAppraisal.managerId?.name}</span>
                  <span className="text-[9px] text-gray-400 font-bold block">{selectedAppraisal.managerId?.email}</span>
                </div>
              </div>

              {/* Ratings */}
              <div className="bg-slate-50 border border-gray-150 rounded-2xl p-4">
                <h4 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-3">Scores Breakdown</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-2 bg-white rounded-xl border border-gray-100">
                    <span className="text-xs font-bold text-gray-600">Performance:</span>
                    {renderStars(selectedAppraisal.ratings.performance)}
                  </div>
                  <div className="flex items-center justify-between p-2 bg-white rounded-xl border border-gray-100">
                    <span className="text-xs font-bold text-gray-600">Communication:</span>
                    {renderStars(selectedAppraisal.ratings.communication)}
                  </div>
                  <div className="flex items-center justify-between p-2 bg-white rounded-xl border border-gray-100">
                    <span className="text-xs font-bold text-gray-600">Teamwork:</span>
                    {renderStars(selectedAppraisal.ratings.teamwork)}
                  </div>
                  <div className="flex items-center justify-between p-2 bg-white rounded-xl border border-gray-100">
                    <span className="text-xs font-bold text-gray-600">Punctuality:</span>
                    {renderStars(selectedAppraisal.ratings.punctuality)}
                  </div>
                </div>
                
                <div className="mt-4 flex items-center justify-between p-3 bg-indigo-50 border border-indigo-100 rounded-xl">
                  <span className="text-xs font-black text-indigo-700 uppercase tracking-wider">Average Rating Score:</span>
                  <span className="font-mono font-black text-indigo-800 text-lg bg-white px-3 py-1 rounded-lg border border-indigo-200">
                    {calculateAverage(selectedAppraisal)} / 5.0
                  </span>
                </div>
              </div>

              {/* Comments details */}
              <div className="grid grid-cols-1 gap-4">
                <div className="bg-white border border-gray-200 rounded-2xl p-4 space-y-1">
                  <span className="text-[10px] text-indigo-650 font-extrabold uppercase tracking-wider">Manager Feedback Comments</span>
                  <p className="text-gray-800 text-xs whitespace-pre-wrap leading-relaxed">
                    {selectedAppraisal.managerFeedback}
                  </p>
                </div>

                <div className="bg-slate-50 border border-gray-150 rounded-2xl p-4 space-y-1">
                  <span className="text-[10px] text-gray-500 font-extrabold uppercase tracking-wider">Employee Self-Evaluation Comments</span>
                  <p className="text-gray-800 text-xs whitespace-pre-wrap leading-relaxed italic">
                    {selectedAppraisal.selfEvaluation ? `"${selectedAppraisal.selfEvaluation}"` : "No self-evaluation response registered yet."}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  onClick={handleCloseViewModal}
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

export default AdminAppraisals;
