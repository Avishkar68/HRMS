import React, { useEffect, useState } from "react";
import api from "../../../utils/api";
import {
  Briefcase,
  Users,
  CalendarClock,
  X,
  MapPin,
  Clock,
  DollarSign,
  AlertCircle,
  Calendar,
  Mail,
  Phone,
  Edit3
} from "lucide-react";

const ManagerRecruitment = () => {
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("postings"); // postings, pipeline

  // Modals / Modifiers
  const [candidateModalOpen, setCandidateModalOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);

  // Forms State
  const [candidateForm, setCandidateForm] = useState({
    status: "Applied",
    interviewDate: "",
    feedback: ""
  });

  const fetchData = async () => {
    try {
      // Endpoints will automatically apply department filtering on the backend if manager
      const [jobsRes, appsRes] = await Promise.all([
        api.get("/recruitment/jobs"),
        api.get("/recruitment/applications")
      ]);
      setJobs(jobsRes.data || []);
      setApplications(appsRes.data || []);
    } catch (error) {
      console.error("Failed to load recruitment data for manager:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApplicationUpdate = async (e) => {
    e.preventDefault();
    try {
      await api.patch(`/recruitment/applications/${selectedApplication._id}`, candidateForm);
      alert("Evaluation records updated successfully");
      setCandidateModalOpen(false);
      setSelectedApplication(null);
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to update candidate application");
    }
  };

  const handleOpenCandidateModal = (app) => {
    setSelectedApplication(app);
    setCandidateForm({
      status: app.status || "Applied",
      interviewDate: app.interviewDate ? new Date(app.interviewDate).toISOString().substring(0, 16) : "",
      feedback: app.feedback || ""
    });
    setCandidateModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  // Group candidate applications by status for ATS columns
  const pipelineStatuses = ["Applied", "Screening", "Interview", "Offered", "Hired", "Rejected"];
  const columnsData = {};
  pipelineStatuses.forEach(status => {
    columnsData[status] = applications.filter(app => app.status === status);
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-905 tracking-tight">Departmental Recruitment</h1>
          <p className="text-gray-500 text-sm mt-1">Review active job listings, examine applicant submissions, schedule interviews, and log evaluation remarks</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        {[
          { id: "postings", label: "Department Positions", icon: Briefcase },
          { id: "pipeline", label: "Applicant Roster & Pipeline", icon: CalendarClock }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`pb-4 px-6 font-bold text-sm border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === t.id
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <t.icon className="w-4.5 h-4.5" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      {activeTab === "postings" && (
        <div className="space-y-6">
          {jobs.length === 0 ? (
            <div className="p-16 text-center text-gray-400 bg-white rounded-3xl border border-gray-200 shadow-sm flex flex-col items-center justify-center gap-2">
              <AlertCircle className="w-8 h-8 text-gray-300" />
              <p className="font-semibold text-gray-800 text-sm">No job openings listed in your department</p>
              <p className="text-xs">Any positions posted by HR for your department will be displayed here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {jobs.map(job => (
                <div key={job._id} className="bg-white rounded-3xl border border-gray-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden">
                  <div className="p-6 space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <span className={`px-2 py-0.5 border rounded-xl text-[9px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border-emerald-250`}>
                          {job.status}
                        </span>
                        <h3 className="text-base font-extrabold text-gray-955 pt-1">{job.title}</h3>
                        <p className="text-xs text-gray-400 font-semibold">{job.departmentId?.name || "My Department"}</p>
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-150 flex items-center justify-center text-gray-500">
                        <Briefcase className="w-5 h-5" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 text-xs text-gray-500 font-semibold">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-gray-400" />
                        <span>{job.location}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        <span>{job.type}</span>
                      </div>
                      <div className="flex items-center gap-1.5 col-span-2">
                        <DollarSign className="w-3.5 h-3.5 text-gray-400" />
                        <span>{job.salaryRange || "Not Specified"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 border-t border-gray-100">
                    <span className="text-xs font-bold text-indigo-650">Applicants: {applications.filter(a => a.jobId?._id === job._id).length}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "pipeline" && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl border border-gray-200 p-4 overflow-x-auto">
            <div className="flex gap-4 min-w-[1000px] h-[600px] overflow-y-hidden">
              {pipelineStatuses.map(status => {
                const candidates = columnsData[status] || [];
                return (
                  <div key={status} className="flex-1 bg-slate-50/50 border border-slate-100 rounded-2xl flex flex-col max-h-full">
                    {/* Header */}
                    <div className="p-3 border-b border-gray-200/80 bg-slate-100/50 flex items-center justify-between rounded-t-2xl">
                      <span className="text-xs font-bold text-gray-800 uppercase tracking-wider">{status}</span>
                      <span className="px-2 py-0.5 bg-gray-200/80 text-gray-600 rounded-lg text-[10px] font-bold font-mono">
                        {candidates.length}
                      </span>
                    </div>

                    {/* Roster list */}
                    <div className="p-2 space-y-2 overflow-y-auto flex-1">
                      {candidates.length === 0 ? (
                        <div className="py-16 text-center text-gray-300 text-xs italic">
                          No candidates
                        </div>
                      ) : (
                        candidates.map(candidate => (
                          <div
                            key={candidate._id}
                            onClick={() => handleOpenCandidateModal(candidate)}
                            className="bg-white p-3 rounded-xl border border-gray-150 shadow-sm hover:shadow-md cursor-pointer hover:border-indigo-300 transition-all space-y-2"
                          >
                            <div>
                              <p className="font-bold text-gray-900 text-xs">{candidate.candidateName}</p>
                              <p className="text-[10px] text-gray-400 truncate mt-0.5">Role: {candidate.jobId?.title || "Role"}</p>
                            </div>
                            <div className="flex justify-between items-center text-[9px] text-gray-450 border-t border-gray-100 pt-1.5 font-semibold">
                              <span>{new Date(candidate.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* CANDIDATE EVALUATION MODAL */}
      {candidateModalOpen && selectedApplication && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl border border-gray-100 overflow-hidden flex flex-col animate-fade-in max-h-[90vh] overflow-y-auto">
            
            <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-extrabold text-gray-955">Candidate Evaluation</h2>
                <p className="text-gray-500 text-xs mt-0.5">View resume details, change evaluation stages, schedule interviews, and log comments</p>
              </div>
              <button 
                onClick={() => {
                  setCandidateModalOpen(false);
                  setSelectedApplication(null);
                }} 
                className="p-1.5 hover:bg-gray-200 rounded-xl text-gray-400 hover:text-gray-655"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Profile Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 border border-slate-150 p-4 rounded-2xl text-left">
                <div className="space-y-1">
                  <span className="text-[9px] text-gray-400 font-bold uppercase block">Candidate Name</span>
                  <span className="text-sm font-bold text-gray-900 block">{selectedApplication.candidateName}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] text-gray-400 font-bold uppercase block">Applied Role</span>
                  <span className="text-sm font-bold text-indigo-650 block">
                    {selectedApplication.jobId?.title || "Role Deleted"}
                  </span>
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] text-gray-400 font-bold uppercase block">Email Address</span>
                  <span className="text-xs font-mono text-gray-700 font-semibold flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5" /> {selectedApplication.candidateEmail}
                  </span>
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] text-gray-400 font-bold uppercase block">Phone Contact</span>
                  <span className="text-xs font-mono text-gray-700 font-semibold flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5" /> {selectedApplication.candidatePhone || "None logged"}
                  </span>
                </div>
                <div className="space-y-1 col-span-1 md:col-span-2 border-t border-slate-200 pt-2">
                  <span className="text-[9px] text-gray-400 font-bold uppercase block">Candidate Resume Summary / Bio</span>
                  <p className="text-xs text-gray-650 leading-relaxed font-medium mt-1">
                    {selectedApplication.resumeUrl || "No resume summary text provided by candidate."}
                  </p>
                </div>
              </div>

              {/* Evaluation inputs */}
              <form onSubmit={handleApplicationUpdate} className="space-y-4 text-left border-t border-gray-100 pt-4">
                <h3 className="text-xs font-black text-gray-800 uppercase tracking-wider">Evaluation & Interview Settings</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider">Pipeline Stage</label>
                    <select
                      value={candidateForm.status}
                      onChange={(e) => setCandidateForm({ ...candidateForm, status: e.target.value })}
                      className="w-full border border-gray-255 bg-white rounded-xl px-3 py-2 text-xs font-semibold cursor-pointer"
                    >
                      {/* Managers can evaluate and screen, but Hired status is finalized through HR/Admin */}
                      <option value="Applied">Applied</option>
                      <option value="Screening">Screening</option>
                      <option value="Interview">Interview</option>
                      <option value="Offered">Offered</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider">Schedule Interview Date & Time</label>
                    <input
                      type="datetime-local"
                      value={candidateForm.interviewDate}
                      onChange={(e) => setCandidateForm({ ...candidateForm, interviewDate: e.target.value })}
                      className="w-full border border-gray-255 bg-white rounded-xl px-3 py-2 text-xs font-semibold cursor-pointer"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider">My Interview Remarks & Feedback</label>
                  <textarea
                    rows={4}
                    value={candidateForm.feedback}
                    onChange={(e) => setCandidateForm({ ...candidateForm, feedback: e.target.value })}
                    className="w-full border border-gray-250 bg-white rounded-xl px-3 py-2 text-xs font-semibold min-h-[80px]"
                    placeholder="Document interview marks, skill evaluation scores, departmental recommendations..."
                  />
                </div>

                <div className="flex gap-3 pt-4 border-t border-gray-100 justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setCandidateModalOpen(false);
                      setSelectedApplication(null);
                    }}
                    className="px-5 py-2 border border-gray-250 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-100 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/10 cursor-pointer"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerRecruitment;
