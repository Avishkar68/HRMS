import React, { useEffect, useState } from "react";
import api from "../../../utils/api";
import { 
  Award, 
  Star, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  X, 
  Eye, 
  Send, 
  Calendar,
  MessageSquare
} from "lucide-react";

const EmployeeAppraisals = () => {
  const [appraisals, setAppraisals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  
  // Modals
  const [selectedAppraisal, setSelectedAppraisal] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEvalModal, setShowEvalModal] = useState(false);
  
  const [selfEvalComment, setSelfEvalComment] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const fetchAppraisals = async () => {
    try {
      const res = await api.get("/appraisals");
      setAppraisals(res.data || []);
    } catch (err) {
      console.error("Error fetching appraisals:", err);
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

  const handleOpenEvalModal = (appraisal) => {
    setErrorMsg("");
    setSelfEvalComment("");
    setSelectedAppraisal(appraisal);
    setShowEvalModal(true);
  };

  const handleOpenViewModal = (appraisal) => {
    setSelectedAppraisal(appraisal);
    setShowViewModal(true);
  };

  const handleCloseModals = () => {
    setShowEvalModal(false);
    setShowViewModal(false);
    setSelectedAppraisal(null);
    setSelfEvalComment("");
    setErrorMsg("");
  };

  const handleEvalSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!selfEvalComment.trim()) {
      setErrorMsg("Please enter your self-evaluation comments.");
      return;
    }

    setActionLoading(true);
    try {
      const res = await api.put(`/appraisals/${selectedAppraisal._id}/self-eval`, {
        selfEvaluation: selfEvalComment
      });
      
      // Update in state
      setAppraisals(appraisals.map(a => a._id === selectedAppraisal._id ? res.data : a));
      handleCloseModals();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Failed to submit self-evaluation. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  // Compute stats
  const totalReviews = appraisals.length;
  const completedReviews = appraisals.filter(a => a.status === "completed").length;
  const pendingReviews = appraisals.filter(a => a.status === "pending-employee-feedback").length;

  const calculateAverage = (appraisal) => {
    if (!appraisal || !appraisal.ratings) return 0;
    const { performance, communication, teamwork, punctuality } = appraisal.ratings;
    return ((performance + communication + teamwork + punctuality) / 4).toFixed(1);
  };

  const getGlobalAverage = () => {
    if (appraisals.length === 0) return "0.0";
    const sum = appraisals.reduce((acc, curr) => {
      return acc + parseFloat(calculateAverage(curr));
    }, 0);
    return (sum / appraisals.length).toFixed(1);
  };

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
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Performance Appraisals</h1>
        <p className="text-gray-500 text-sm mt-1">Review feedback from leadership and record your self-evaluations</p>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Overall Rating</span>
            <span className="text-3xl font-black text-slate-900 block mt-1">{getGlobalAverage()} / 5.0</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500">
            <Star className="w-6 h-6 fill-amber-400" />
          </div>
        </div>
        <div className="bg-emerald-50/20 p-5 rounded-2xl border border-emerald-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">Completed Appraisals</span>
            <span className="text-3xl font-black text-emerald-700 block mt-1">{completedReviews}</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
        <div className="bg-amber-50/20 p-5 rounded-2xl border border-amber-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] text-amber-600 font-bold uppercase tracking-wider">Pending Self-Evaluation</span>
            <span className="text-3xl font-black text-amber-700 block mt-1">{pendingReviews}</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
            <Clock className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Reviews Table */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
        {appraisals.length === 0 ? (
          <div className="p-16 text-center text-gray-400 flex flex-col items-center justify-center gap-3">
            <Award className="w-12 h-12 text-gray-300" />
            <h3 className="font-extrabold text-gray-900 text-sm">No appraisals published yet</h3>
            <p className="text-xs text-gray-400">Once your manager submits an appraisal, it will be visible here for self-evaluation.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left p-4 font-semibold text-gray-600">Cycle Period</th>
                  <th className="text-left p-4 font-semibold text-gray-600">Evaluated By</th>
                  <th className="text-left p-4 font-semibold text-gray-600">Avg Score</th>
                  <th className="text-left p-4 font-semibold text-gray-600">Status</th>
                  <th className="text-left p-4 font-semibold text-gray-600">Reviewed Date</th>
                  <th className="text-center p-4 font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {appraisals.map((appraisal) => {
                  const isPending = appraisal.status === "pending-employee-feedback";
                  const avgScore = calculateAverage(appraisal);
                  const reviewerName = appraisal.managerId?.name || "Manager";

                  return (
                    <tr key={appraisal._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 font-extrabold text-indigo-700">
                        {appraisal.period}
                      </td>
                      <td className="p-4 font-medium text-gray-900">
                        {reviewerName}
                      </td>
                      <td className="p-4 font-mono font-bold text-gray-950 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="bg-slate-100 border border-gray-200 px-2 py-0.5 rounded text-xs">
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
                          {isPending ? "Pending Self Eval" : "Completed"}
                        </span>
                      </td>
                      <td className="p-4 text-gray-400 text-xs font-mono">
                        {new Date(appraisal.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                      </td>
                      <td className="p-4 text-center">
                        {isPending ? (
                          <button
                            onClick={() => handleOpenEvalModal(appraisal)}
                            className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl cursor-pointer shadow-sm active:scale-[0.98] transition-all"
                          >
                            <Send className="w-3.5 h-3.5" />
                            Submit Self-Eval
                          </button>
                        ) : (
                          <button
                            onClick={() => handleOpenViewModal(appraisal)}
                            className="inline-flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 border border-gray-200 text-gray-700 text-xs font-bold px-3 py-1.5 rounded-xl cursor-pointer active:scale-[0.98] transition-all"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            View Summary
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Submit Self Evaluation Modal */}
      {showEvalModal && selectedAppraisal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={handleCloseModals} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-150 w-full max-w-lg p-6 relative z-10 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
              <div>
                <h3 className="text-lg font-black text-gray-900">Submit Self-Evaluation</h3>
                <p className="text-xs text-gray-400 mt-0.5">Cycle period: {selectedAppraisal.period}</p>
              </div>
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

            <div className="space-y-4">
              <div className="bg-slate-50 border border-gray-150 rounded-2xl p-4 space-y-3">
                <h4 className="text-xs font-extrabold text-gray-500 uppercase tracking-wider">Ratings Summary from {selectedAppraisal.managerId?.name}</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs text-gray-400 font-bold">Performance</span>
                    {renderStars(selectedAppraisal.ratings.performance)}
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs text-gray-400 font-bold">Communication</span>
                    {renderStars(selectedAppraisal.ratings.communication)}
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs text-gray-400 font-bold">Teamwork</span>
                    {renderStars(selectedAppraisal.ratings.teamwork)}
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs text-gray-400 font-bold">Punctuality</span>
                    {renderStars(selectedAppraisal.ratings.punctuality)}
                  </div>
                </div>
                <div className="pt-2 border-t border-gray-200">
                  <span className="text-xs text-gray-400 font-bold block mb-1">Manager Feedback Comments</span>
                  <p className="text-gray-700 text-xs italic bg-white p-2.5 rounded-xl border border-gray-100 whitespace-pre-wrap">
                    "{selectedAppraisal.managerFeedback}"
                  </p>
                </div>
              </div>

              <form onSubmit={handleEvalSubmit} className="space-y-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-indigo-700 uppercase tracking-wider flex items-center gap-1">
                    <MessageSquare className="w-3.5 h-3.5" />
                    Your Self-Evaluation Comments
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Reflect on your achievements, goals, and areas of growth during this cycle. Your comments will be logged permanently alongside the manager ratings."
                    value={selfEvalComment}
                    onChange={(e) => setSelfEvalComment(e.target.value)}
                    className="w-full border border-gray-250 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none min-h-[100px]"
                    required
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={handleCloseModals}
                    className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-bold hover:bg-slate-50 transition-all cursor-pointer text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md shadow-indigo-500/10 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 cursor-pointer text-xs disabled:opacity-75"
                  >
                    {actionLoading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                    <span>Submit Self-Evaluation</span>
                  </button>
                </div>
              </form>
            </div>
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
                <h3 className="text-lg font-black text-gray-900">Performance Evaluation Report</h3>
                <p className="text-xs text-gray-400 mt-0.5">Cycle: {selectedAppraisal.period}</p>
              </div>
              <button onClick={handleCloseModals} className="p-1.5 hover:bg-slate-100 text-gray-400 hover:text-gray-650 rounded-xl transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-5">
              {/* Ratings grid */}
              <div className="bg-slate-50 border border-gray-150 rounded-2xl p-4">
                <h4 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-3">Scores Overview</h4>
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
                  <span className="text-xs font-black text-indigo-700 uppercase tracking-wider">Overall Appraisal Score:</span>
                  <span className="font-mono font-black text-indigo-800 text-lg bg-white px-3 py-1 rounded-lg border border-indigo-200">
                    {calculateAverage(selectedAppraisal)} / 5.0
                  </span>
                </div>
              </div>

              {/* Comments details */}
              <div className="grid grid-cols-1 gap-4">
                <div className="bg-white border border-gray-200 rounded-2xl p-4 space-y-1">
                  <span className="text-[10px] text-indigo-600 font-extrabold uppercase tracking-wider">Feedback from {selectedAppraisal.managerId?.name}</span>
                  <p className="text-gray-800 text-xs whitespace-pre-wrap leading-relaxed">
                    {selectedAppraisal.managerFeedback}
                  </p>
                </div>

                <div className="bg-slate-50 border border-gray-150 rounded-2xl p-4 space-y-1">
                  <span className="text-[10px] text-gray-500 font-extrabold uppercase tracking-wider">Your Self-Evaluation Comments</span>
                  <p className="text-gray-800 text-xs whitespace-pre-wrap leading-relaxed italic">
                    {selectedAppraisal.selfEvaluation ? `"${selectedAppraisal.selfEvaluation}"` : "No self-evaluation comments provided."}
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

export default EmployeeAppraisals;
