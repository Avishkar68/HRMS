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
  Award,
  Star,
  Eye,
  UserCheck
} from "lucide-react";

const ManagerAppraisals = () => {
  const [appraisals, setAppraisals] = useState([]);
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  
  // Search/Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Modal/Overlay state
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedAppraisal, setSelectedAppraisal] = useState(null);
  
  const [modalForm, setModalForm] = useState({
    userId: "",
    period: "Annual 2026",
    ratings: {
      performance: 5,
      communication: 5,
      teamwork: 5,
      punctuality: 5
    },
    managerFeedback: ""
  });
  const [errorMsg, setErrorMsg] = useState("");

  const fetchData = async () => {
    try {
      const [appraisalsRes, teamRes] = await Promise.all([
        api.get("/appraisals"),
        api.get("/manager/team")
      ]);
      setAppraisals(appraisalsRes.data || []);
      setTeam(teamRes.data || []);
    } catch (err) {
      console.error("Error loading appraisals/team data:", err);
    }
  };

  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      await fetchData();
      setLoading(false);
    };
    initData();
  }, []);

  const handleOpenCreateModal = () => {
    setErrorMsg("");
    setModalForm({
      userId: "",
      period: "Annual 2026",
      ratings: {
        performance: 5,
        communication: 5,
        teamwork: 5,
        punctuality: 5
      },
      managerFeedback: ""
    });
    setShowModal(true);
  };

  const handleOpenViewModal = (appraisal) => {
    setSelectedAppraisal(appraisal);
    setShowViewModal(true);
  };

  const handleCloseModals = () => {
    setShowModal(false);
    setShowViewModal(false);
    setSelectedAppraisal(null);
    setErrorMsg("");
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!modalForm.userId) {
      setErrorMsg("Please select an employee to evaluate.");
      return;
    }
    if (!modalForm.period.trim()) {
      setErrorMsg("Review period is required.");
      return;
    }
    if (!modalForm.managerFeedback.trim()) {
      setErrorMsg("Manager feedback comments are required.");
      return;
    }

    setActionLoading(true);
    try {
      const res = await api.post("/appraisals", modalForm);
      setAppraisals([res.data, ...appraisals]);
      handleCloseModals();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Failed to create performance review.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteAppraisal = async (id) => {
    if (!window.confirm("Are you sure you want to delete this appraisal record? This action cannot be undone.")) return;

    try {
      await api.delete(`/appraisals/${id}`);
      setAppraisals(appraisals.filter(a => a._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete appraisal.");
    }
  };

  const calculateAverage = (appraisal) => {
    if (!appraisal || !appraisal.ratings) return 0;
    const { performance, communication, teamwork, punctuality } = appraisal.ratings;
    return ((performance + communication + teamwork + punctuality) / 4).toFixed(1);
  };

  const filteredAppraisals = appraisals.filter((a) => {
    const empName = a.userId?.name || "";
    const period = a.period || "";
    const matchesSearch = 
      empName.toLowerCase().includes(searchQuery.toLowerCase()) || 
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
            className={`w-4 h-4 ${
              star <= rating ? "text-amber-400 fill-amber-400" : "text-gray-200"
            }`}
          />
        ))}
      </div>
    );
  };

  // KPIs
  const totalReviews = appraisals.length;
  const completedReviews = appraisals.filter(a => a.status === "completed").length;
  const pendingReviews = appraisals.filter(a => a.status === "pending-employee-feedback").length;

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Performance Evaluations</h1>
          <p className="text-gray-500 text-sm mt-1">Conduct and review performance feedback for your direct reports</p>
        </div>
        <button 
          onClick={handleOpenCreateModal}
          className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-2xl font-bold transition-all active:scale-[0.98] shadow-md shadow-indigo-600/10 cursor-pointer text-sm"
        >
          <Plus className="w-4.5 h-4.5" />
          <span>New Appraisal</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Total Evaluations Conducted</span>
          <span className="text-3xl font-black text-gray-950 mt-2 font-mono">{totalReviews}</span>
        </div>
        <div className="bg-emerald-50/20 p-5 rounded-2xl border border-emerald-100 shadow-sm flex flex-col justify-between">
          <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">Completed Cycles</span>
          <span className="text-3xl font-black text-emerald-700 mt-2 font-mono">{completedReviews}</span>
        </div>
        <div className="bg-amber-50/20 p-5 rounded-2xl border border-amber-100 shadow-sm flex flex-col justify-between">
          <span className="text-[10px] text-amber-600 font-bold uppercase tracking-wider">Awaiting Self-Evaluation</span>
          <span className="text-3xl font-black text-amber-700 mt-2 font-mono">{pendingReviews}</span>
        </div>
      </div>

      {/* Roster Controls */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search by employee name or period..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50/50 border border-gray-200 rounded-xl pl-10 pr-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto">
          <span className="text-xs text-gray-400 font-bold uppercase mr-1 whitespace-nowrap">Status:</span>
          {[
            { id: "all", label: "All Reviews" },
            { id: "pending-employee-feedback", label: "Awaiting Self-Eval" },
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

      {/* Appraisals Table */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
        {filteredAppraisals.length === 0 ? (
          <div className="p-16 text-center text-gray-400 flex flex-col items-center justify-center gap-3">
            <Award className="w-10 h-10 text-gray-300" />
            <h3 className="font-extrabold text-gray-900 text-sm">No appraisals found</h3>
            <p className="text-xs text-gray-400">Records of performance evaluations will appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left p-4 font-semibold text-gray-600">Employee</th>
                  <th className="text-left p-4 font-semibold text-gray-600">Review Cycle</th>
                  <th className="text-left p-4 font-semibold text-gray-600">Average Score</th>
                  <th className="text-left p-4 font-semibold text-gray-600">Status</th>
                  <th className="text-left p-4 font-semibold text-gray-600">Date Logged</th>
                  <th className="text-center p-4 font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredAppraisals.map((appraisal) => {
                  const isPending = appraisal.status === "pending-employee-feedback";
                  const avgScore = calculateAverage(appraisal);
                  const employeeName = appraisal.userId?.name || "Deleted Employee";

                  return (
                    <tr key={appraisal._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 font-extrabold text-slate-900">
                        {employeeName}
                      </td>
                      <td className="p-4 font-medium text-indigo-700">
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
                          {isPending ? "Awaiting Employee Response" : "Completed"}
                        </span>
                      </td>
                      <td className="p-4 text-gray-400 text-xs font-mono">
                        {new Date(appraisal.createdAt).toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' })}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleOpenViewModal(appraisal)}
                            className="p-1.5 text-gray-450 hover:text-indigo-650 hover:bg-slate-50 border border-transparent hover:border-gray-150 rounded-xl transition-all cursor-pointer"
                            title="View Summary"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteAppraisal(appraisal._id)}
                            className="p-1.5 text-gray-450 hover:text-rose-650 hover:bg-rose-50/50 border border-transparent hover:border-rose-100 rounded-xl transition-all cursor-pointer"
                            title="Delete Record"
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

      {/* New Appraisal Slider Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={handleCloseModals} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-150 w-full max-w-lg p-6 relative z-10 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
              <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                <Award className="w-5 h-5 text-indigo-600" />
                Conduct Performance Review
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
              <div className="grid grid-cols-2 gap-4">
                {/* Employee selection */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Select Employee</label>
                  <select
                    value={modalForm.userId}
                    onChange={(e) => setModalForm({...modalForm, userId: e.target.value})}
                    className="w-full border border-gray-250 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
                    required
                  >
                    <option value="">-- Choose Employee --</option>
                    {team.map(emp => (
                      <option key={emp._id} value={emp._id}>{emp.name}</option>
                    ))}
                  </select>
                </div>

                {/* Period */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Review Cycle Period</label>
                  <input 
                    type="text"
                    placeholder="e.g. Annual 2026, Q2 2026"
                    value={modalForm.period}
                    onChange={(e) => setModalForm({...modalForm, period: e.target.value})}
                    className="w-full border border-gray-250 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    required
                  />
                </div>
              </div>

              {/* Ratings Segment */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-extrabold text-indigo-700 uppercase tracking-wider mb-1">Score Metrics (1-5 Stars)</h4>
                
                {/* Performance */}
                <div className="flex items-center justify-between p-2.5 bg-slate-50 border border-gray-150 rounded-xl">
                  <span className="text-xs font-bold text-gray-600">Performance Ratings</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setModalForm({
                          ...modalForm,
                          ratings: { ...modalForm.ratings, performance: star }
                        })}
                        className="cursor-pointer"
                      >
                        <Star className={`w-5 h-5 ${star <= modalForm.ratings.performance ? "text-amber-400 fill-amber-400" : "text-gray-200"}`} />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Communication */}
                <div className="flex items-center justify-between p-2.5 bg-slate-50 border border-gray-150 rounded-xl">
                  <span className="text-xs font-bold text-gray-600">Communication & Alignment</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setModalForm({
                          ...modalForm,
                          ratings: { ...modalForm.ratings, communication: star }
                        })}
                        className="cursor-pointer"
                      >
                        <Star className={`w-5 h-5 ${star <= modalForm.ratings.communication ? "text-amber-400 fill-amber-400" : "text-gray-200"}`} />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Teamwork */}
                <div className="flex items-center justify-between p-2.5 bg-slate-50 border border-gray-150 rounded-xl">
                  <span className="text-xs font-bold text-gray-600">Collaboration & Teamwork</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setModalForm({
                          ...modalForm,
                          ratings: { ...modalForm.ratings, teamwork: star }
                        })}
                        className="cursor-pointer"
                      >
                        <Star className={`w-5 h-5 ${star <= modalForm.ratings.teamwork ? "text-amber-400 fill-amber-400" : "text-gray-200"}`} />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Punctuality */}
                <div className="flex items-center justify-between p-2.5 bg-slate-50 border border-gray-150 rounded-xl">
                  <span className="text-xs font-bold text-gray-600">Attendance & Punctuality</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setModalForm({
                          ...modalForm,
                          ratings: { ...modalForm.ratings, punctuality: star }
                        })}
                        className="cursor-pointer"
                      >
                        <Star className={`w-5 h-5 ${star <= modalForm.ratings.punctuality ? "text-amber-400 fill-amber-400" : "text-gray-200"}`} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Manager Feedback */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Detailed Feedback Comments</label>
                <textarea 
                  rows={4}
                  placeholder="Record constructive feedback regarding highlights, achievements, and concrete growth recommendations for this review cycle..."
                  value={modalForm.managerFeedback}
                  onChange={(e) => setModalForm({...modalForm, managerFeedback: e.target.value})}
                  className="w-full border border-gray-250 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none min-h-[90px]"
                  required
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
                  <span>Publish Appraisal</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {showViewModal && selectedAppraisal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={handleCloseModals} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-150 w-full max-w-lg p-6 relative z-10 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
              <div>
                <h3 className="text-lg font-black text-gray-900">Performance Appraisal Summary</h3>
                <p className="text-xs text-gray-400 mt-0.5">Cycle Period: {selectedAppraisal.period}</p>
              </div>
              <button onClick={handleCloseModals} className="p-1.5 hover:bg-slate-100 text-gray-400 hover:text-gray-650 rounded-xl transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-5">
              {/* Profile Card */}
              <div className="bg-slate-50 border border-gray-150 rounded-2xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-extrabold flex items-center justify-center text-sm">
                  {(selectedAppraisal.userId?.name || "E").substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-gray-900">{selectedAppraisal.userId?.name}</h4>
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{selectedAppraisal.userId?.email}</span>
                </div>
              </div>

              {/* Ratings */}
              <div className="bg-slate-50 border border-gray-150 rounded-2xl p-4">
                <h4 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-3">Evaluations Breakdown</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-2 bg-white rounded-xl border border-gray-100">
                    <span className="text-xs font-bold text-gray-650">Performance:</span>
                    {renderStars(selectedAppraisal.ratings.performance)}
                  </div>
                  <div className="flex items-center justify-between p-2 bg-white rounded-xl border border-gray-100">
                    <span className="text-xs font-bold text-gray-655">Communication:</span>
                    {renderStars(selectedAppraisal.ratings.communication)}
                  </div>
                  <div className="flex items-center justify-between p-2 bg-white rounded-xl border border-gray-100">
                    <span className="text-xs font-bold text-gray-655">Teamwork:</span>
                    {renderStars(selectedAppraisal.ratings.teamwork)}
                  </div>
                  <div className="flex items-center justify-between p-2 bg-white rounded-xl border border-gray-100">
                    <span className="text-xs font-bold text-gray-655">Punctuality:</span>
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
                  <span className="text-[10px] text-indigo-650 font-extrabold uppercase tracking-wider">Your Feedback Comments</span>
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

export default ManagerAppraisals;
