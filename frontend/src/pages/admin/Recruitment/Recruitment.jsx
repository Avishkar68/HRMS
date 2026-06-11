import React, { useEffect, useState } from "react";
import api from "../../../utils/api";
import {
  Briefcase,
  Users,
  CalendarClock,
  UserPlus,
  Plus,
  X,
  Search,
  MapPin,
  Clock,
  DollarSign,
  AlertCircle,
  ChevronRight,
  Sparkles,
  Calendar,
  CheckCircle2,
  Trash2,
  Edit3,
  Mail,
  Phone,
  FileText,
  UserCheck,
  Building2,
  AlertTriangle
} from "lucide-react";

const Recruitment = () => {
  const [jobs, setJobs] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [managers, setManagers] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview"); // overview, postings, pipeline, publicBoard

  // Modals / Modifiers
  const [jobModalOpen, setJobModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [candidateModalOpen, setCandidateModalOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  
  // Provisioning Modal State
  const [provisionOpen, setProvisionOpen] = useState(false);

  // Forms State
  const [jobForm, setJobForm] = useState({
    title: "",
    departmentId: "",
    location: "Remote",
    type: "Full-time",
    description: "",
    requirements: "",
    salaryRange: "",
    status: "Active"
  });

  const [candidateForm, setCandidateForm] = useState({
    status: "Applied",
    interviewDate: "",
    feedback: ""
  });

  const [publicApplyForm, setPublicApplyForm] = useState({
    jobId: "",
    candidateName: "",
    candidateEmail: "",
    candidatePhone: "",
    resumeUrl: ""
  });

  const [provisionForm, setProvisionForm] = useState({
    name: "",
    email: "",
    password: "Password123",
    role: "employee",
    managerId: "",
    packageSalary: ""
  });

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const companyId = currentUser.companyId || "";

  const fetchData = async () => {
    try {
      const [jobsRes, deptsRes, appsRes, managersRes] = await Promise.all([
        api.get("/recruitment/jobs"),
        api.get("/admin/departments"),
        api.get("/recruitment/applications"),
        api.get("/admin/managers")
      ]);
      setJobs(jobsRes.data || []);
      setDepartments(deptsRes.data || []);
      setApplications(appsRes.data || []);
      setManagers(managersRes.data || []);
    } catch (error) {
      console.error("Failed to load recruitment data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleJobSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingJob) {
        await api.patch(`/recruitment/jobs/${editingJob._id}`, jobForm);
        alert("Job opening updated successfully");
      } else {
        await api.post("/recruitment/jobs", jobForm);
        alert("Job opening posted successfully");
      }
      setJobModalOpen(false);
      setEditingJob(null);
      setJobForm({
        title: "",
        departmentId: "",
        location: "Remote",
        type: "Full-time",
        description: "",
        requirements: "",
        salaryRange: "",
        status: "Active"
      });
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to save job posting");
    }
  };

  const handleEditJob = (job) => {
    setEditingJob(job);
    setJobForm({
      title: job.title,
      departmentId: job.departmentId?._id || job.departmentId || "",
      location: job.location || "Remote",
      type: job.type || "Full-time",
      description: job.description || "",
      requirements: job.requirements || "",
      salaryRange: job.salaryRange || "",
      status: job.status || "Active"
    });
    setJobModalOpen(true);
  };

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm("Are you sure you want to delete this job posting? This will also delete all candidate applications associated with it.")) return;
    try {
      await api.delete(`/recruitment/jobs/${jobId}`);
      alert("Job posting and associated applications deleted");
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to delete job posting");
    }
  };

  const handleApplicationUpdate = async (e) => {
    e.preventDefault();
    try {
      await api.patch(`/recruitment/applications/${selectedApplication._id}`, candidateForm);
      alert("Application status updated");
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

  const handlePublicApplySubmit = async (e) => {
    e.preventDefault();
    if (!publicApplyForm.jobId) {
      alert("Please select a job position to apply");
      return;
    }
    try {
      await api.post("/recruitment/public/apply", publicApplyForm);
      alert("Application submitted successfully! Your candidate record is now visible in the ATS pipeline.");
      setPublicApplyForm({
        jobId: "",
        candidateName: "",
        candidateEmail: "",
        candidatePhone: "",
        resumeUrl: ""
      });
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to submit application");
    }
  };

  const handleOpenProvisionModal = (app) => {
    setProvisionForm({
      name: app.candidateName,
      email: app.candidateEmail,
      password: "Password123",
      role: "employee",
      managerId: "",
      packageSalary: app.jobId?.salaryRange ? String(parseInt(app.jobId.salaryRange.replace(/[^0-9]/g, '')) || "") : ""
    });
    setProvisionOpen(true);
  };

  const handleProvisionSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/admin/users", provisionForm);
      alert(`User ${provisionForm.name} provisioned successfully as an employee.`);
      setProvisionOpen(false);
      // Automatically archive/move application status to hired
      if (selectedApplication) {
        await api.patch(`/recruitment/applications/${selectedApplication._id}`, { status: "Hired" });
      }
      setCandidateModalOpen(false);
      setSelectedApplication(null);
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to provision candidate as employee");
    }
  };

  const handleDeleteApplication = async (appId) => {
    if (!window.confirm("Are you sure you want to permanently delete this candidate application?")) return;
    try {
      await api.delete(`/recruitment/applications/${appId}`);
      alert("Application deleted");
      setCandidateModalOpen(false);
      setSelectedApplication(null);
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to delete candidate application");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  // Calculate ATS Summary Metrics
  const activeJobsCount = jobs.filter(j => j.status === "Active").length;
  const totalAppsCount = applications.length;
  const interviewingCount = applications.filter(a => a.status === "Interview").length;
  const hiredCount = applications.filter(a => a.status === "Hired").length;

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
          <h1 className="text-3xl font-extrabold text-gray-950 tracking-tight">Recruitment Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Manage job openings, review candidates, track interviews, and onboard hired talent</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setEditingJob(null);
              setJobForm({
                title: "",
                departmentId: "",
                location: "Remote",
                type: "Full-time",
                description: "",
                requirements: "",
                salaryRange: "",
                status: "Active"
              });
              setJobModalOpen(true);
            }}
            className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-2xl font-bold transition-all active:scale-[0.98] shadow-md shadow-indigo-600/10 cursor-pointer"
          >
            <Plus className="w-4.5 h-4.5" />
            <span>Post Job opening</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        {[
          { id: "overview", label: "Overview", icon: Briefcase },
          { id: "postings", label: "Job Openings", icon: Users },
          { id: "pipeline", label: "Candidate Pipeline (ATS)", icon: CalendarClock },
          { id: "publicBoard", label: "Interactive Job Board Preview", icon: Sparkles }
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
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Active Job Postings</span>
              <span className="text-3xl font-black text-slate-950 mt-2 font-mono">{activeJobsCount}</span>
              <span className="text-[10px] text-indigo-600 font-bold mt-1">Open positions</span>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Total Applicant Registry</span>
              <span className="text-3xl font-black text-slate-950 mt-2 font-mono">{totalAppsCount}</span>
              <span className="text-[10px] text-emerald-600 font-bold mt-1">Active resumes</span>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Interviews Scheduled</span>
              <span className="text-3xl font-black text-slate-950 mt-2 font-mono">{interviewingCount}</span>
              <span className="text-[10px] text-amber-600 font-bold mt-1">Currently evaluating</span>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Hired Positions</span>
              <span className="text-3xl font-black text-slate-950 mt-2 font-mono">{hiredCount}</span>
              <span className="text-[10px] text-emerald-600 font-bold mt-1">Successfully onboarded</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Quick overview pipeline details */}
            <div className="bg-white rounded-3xl border border-gray-200 p-6 space-y-4">
              <h3 className="text-base font-extrabold text-gray-900">Applicant Funnel Status</h3>
              <div className="space-y-3">
                {pipelineStatuses.map(status => {
                  const count = columnsData[status]?.length || 0;
                  const percent = totalAppsCount > 0 ? (count / totalAppsCount) * 100 : 0;
                  return (
                    <div key={status} className="space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-gray-700">{status}</span>
                        <span className="font-mono text-gray-500 font-bold">{count} ({percent.toFixed(0)}%)</span>
                      </div>
                      <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-indigo-600 rounded-full" 
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Upcoming Interviews schedule list */}
            <div className="bg-white rounded-3xl border border-gray-200 p-6 space-y-4">
              <h3 className="text-base font-extrabold text-gray-900">Upcoming Interviews</h3>
              <div className="divide-y divide-gray-100 max-h-[300px] overflow-y-auto pr-1">
                {applications.filter(a => a.status === "Interview" && a.interviewDate).length === 0 ? (
                  <div className="py-12 text-center text-gray-400 text-xs">
                    <CalendarClock className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                    No upcoming interviews scheduled yet.
                  </div>
                ) : (
                  applications
                    .filter(a => a.status === "Interview" && a.interviewDate)
                    .map(app => (
                      <div key={app._id} className="py-3 flex items-center justify-between gap-4">
                        <div className="min-w-0">
                          <p className="font-bold text-gray-950 text-sm">{app.candidateName}</p>
                          <p className="text-xs text-gray-400 mt-0.5 truncate">{app.jobId?.title || "Candidate"} - {app.jobId?.departmentId?.name || "General"}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="inline-flex px-2 py-1 bg-amber-50 border border-amber-100 text-amber-700 rounded-xl text-[10px] font-black uppercase">
                            {new Date(app.interviewDate).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "postings" && (
        <div className="space-y-6">
          {jobs.length === 0 ? (
            <div className="p-16 text-center text-gray-400 bg-white rounded-3xl border border-gray-200 shadow-sm flex flex-col items-center justify-center gap-2">
              <AlertCircle className="w-8 h-8 text-gray-300" />
              <p className="font-semibold text-gray-800 text-sm">No job openings created yet</p>
              <p className="text-xs">Click &quot;Post Job opening&quot; above to create your first vacancy listing.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {jobs.map(job => (
                <div key={job._id} className="bg-white rounded-3xl border border-gray-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden">
                  <div className="p-6 space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <span className={`px-2 py-0.5 border rounded-xl text-[9px] font-black uppercase tracking-wider ${
                          job.status === "Active" ? "bg-emerald-50 text-emerald-700 border-emerald-250" :
                          job.status === "Draft" ? "bg-gray-50 text-gray-550 border-gray-200" :
                          "bg-rose-50 text-rose-700 border-rose-250"
                        }`}>
                          {job.status}
                        </span>
                        <h3 className="text-base font-extrabold text-gray-955 pt-1">{job.title}</h3>
                        <p className="text-xs text-gray-400 font-semibold">{job.departmentId?.name || "General Operations"}</p>
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

                  <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-[10px] text-gray-400 font-mono">Applicants: {applications.filter(a => a.jobId?._id === job._id).length}</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEditJob(job)}
                        className="p-1.5 hover:bg-gray-200 rounded-lg text-gray-600 hover:text-gray-900 transition-colors"
                        title="Edit Job opening"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteJob(job._id)}
                        className="p-1.5 hover:bg-rose-50 rounded-lg text-rose-600 hover:text-rose-900"
                        title="Delete Job opening"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
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
                              <p className="text-[10px] text-gray-400 truncate mt-0.5">Applied to: {candidate.jobId?.title || "Role"}</p>
                            </div>
                            <div className="flex justify-between items-center text-[9px] text-gray-450 border-t border-gray-100 pt-1.5 font-semibold">
                              <span>{candidate.jobId?.departmentId?.name || "General"}</span>
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

      {activeTab === "publicBoard" && (
        <div className="bg-white rounded-3xl border border-gray-200 p-6 space-y-6">
          <div className="border-b border-gray-100 pb-3 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            <div>
              <h3 className="text-base font-extrabold text-gray-950">Mock Public Job Board Preview</h3>
              <p className="text-xs text-gray-400 mt-0.5">Simulate candidate applications to test dynamic ATS pipelining and direct employee provisioning flows.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Simulation Job Board Form */}
            <div className="lg:col-span-1 bg-slate-50 border border-gray-200 rounded-2xl p-5 space-y-4">
              <h4 className="text-xs font-black text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                <Plus className="w-4 h-4" />
                Submit Mock Application
              </h4>

              <form onSubmit={handlePublicApplySubmit} className="space-y-3 text-left">
                <div className="space-y-1">
                  <label className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider">Position applied</label>
                  <select
                    value={publicApplyForm.jobId}
                    onChange={(e) => setPublicApplyForm({ ...publicApplyForm, jobId: e.target.value })}
                    className="w-full border border-gray-250 bg-white rounded-xl px-3 py-2 text-xs font-semibold"
                    required
                  >
                    <option value="">-- Choose job position --</option>
                    {jobs.filter(j => j.status === "Active").map(j => (
                      <option key={j._id} value={j._id}>{j.title} ({j.departmentId?.name || "General"})</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider">Candidate Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Robin Sharma"
                    value={publicApplyForm.candidateName}
                    onChange={(e) => setPublicApplyForm({ ...publicApplyForm, candidateName: e.target.value })}
                    className="w-full border border-gray-250 bg-white rounded-xl px-3 py-2 text-xs font-semibold"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider">Candidate Email</label>
                  <input
                    type="email"
                    placeholder="e.g. robin@gmail.com"
                    value={publicApplyForm.candidateEmail}
                    onChange={(e) => setPublicApplyForm({ ...publicApplyForm, candidateEmail: e.target.value })}
                    className="w-full border border-gray-250 bg-white rounded-xl px-3 py-2 text-xs font-semibold"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider">Phone number (optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. +91 9876543210"
                    value={publicApplyForm.candidatePhone}
                    onChange={(e) => setPublicApplyForm({ ...publicApplyForm, candidatePhone: e.target.value })}
                    className="w-full border border-gray-250 bg-white rounded-xl px-3 py-2 text-xs font-semibold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider">Mock Resume / Profile Bio</label>
                  <textarea
                    rows={3}
                    placeholder="Brief summary of skills, certifications, and background..."
                    value={publicApplyForm.resumeUrl}
                    onChange={(e) => setPublicApplyForm({ ...publicApplyForm, resumeUrl: e.target.value })}
                    className="w-full border border-gray-250 bg-white rounded-xl px-3 py-2 text-xs font-semibold min-h-[60px]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all active:scale-[0.98] shadow-sm cursor-pointer"
                >
                  Submit Candidate Application
                </button>
              </form>
            </div>

            {/* Simulated Live Job Board preview */}
            <div className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl p-5 space-y-4">
              <h4 className="text-xs font-black text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                <Briefcase className="w-4 h-4" />
                Live Careers Listing (Job Seeker View)
              </h4>

              <div className="space-y-3 divide-y divide-gray-100 max-h-[450px] overflow-y-auto pr-1">
                {jobs.filter(j => j.status === "Active").length === 0 ? (
                  <div className="py-20 text-center text-gray-400 text-xs">
                    No active job listings. Create one in the "Job Openings" tab.
                  </div>
                ) : (
                  jobs
                    .filter(j => j.status === "Active")
                    .map((j, idx) => (
                      <div key={j._id} className={`pt-3 ${idx === 0 ? "" : "border-t"} space-y-2 text-left`}>
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <h5 className="font-bold text-gray-900 text-sm">{j.title}</h5>
                            <p className="text-[10px] text-indigo-600 font-bold mt-0.5">{j.departmentId?.name || "General Operations"}</p>
                          </div>
                          <span className="text-[10px] text-gray-500 font-mono">{j.salaryRange}</span>
                        </div>
                        <div className="flex gap-4 text-[10px] text-gray-400 font-bold uppercase">
                          <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {j.location}</span>
                          <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {j.type}</span>
                        </div>
                        <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                          <p className="text-xs font-bold text-gray-400">Description</p>
                          <p className="text-xs font-medium text-gray-700 leading-relaxed mt-1">{j.description}</p>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* JOB CREATION / EDITING MODAL */}
      {jobModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md border border-gray-100 overflow-hidden flex flex-col animate-fade-in max-h-[90vh] overflow-y-auto">
            
            <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-extrabold text-gray-955">{editingJob ? "Edit Job Posting" : "Post Job Opening"}</h2>
                <p className="text-gray-500 text-xs mt-0.5">Advertise vacancies to solicit resumes</p>
              </div>
              <button 
                onClick={() => setJobModalOpen(false)} 
                className="p-1.5 hover:bg-gray-200 rounded-xl text-gray-400 hover:text-gray-655"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleJobSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Job Title</label>
                <input
                  value={jobForm.title}
                  onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
                  className="w-full border border-gray-250 rounded-xl px-3 py-2 text-xs font-semibold bg-white"
                  placeholder="e.g. Senior Backend Engineer"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Department</label>
                  <select
                    value={jobForm.departmentId}
                    onChange={(e) => setJobForm({ ...jobForm, departmentId: e.target.value })}
                    className="w-full border border-gray-255 rounded-xl px-3 py-2 text-xs font-semibold bg-white cursor-pointer"
                    required
                  >
                    <option value="">Choose department</option>
                    {departments.map((d) => (
                      <option key={d._id} value={d._id}>{d.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Location</label>
                  <input
                    value={jobForm.location}
                    onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })}
                    className="w-full border border-gray-250 rounded-xl px-3 py-2 text-xs font-semibold bg-white"
                    placeholder="e.g. Remote / Chicago, IL"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Job Type</label>
                  <select
                    value={jobForm.type}
                    onChange={(e) => setJobForm({ ...jobForm, type: e.target.value })}
                    className="w-full border border-gray-255 rounded-xl px-3 py-2 text-xs font-semibold bg-white cursor-pointer"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Salary Range</label>
                  <input
                    value={jobForm.salaryRange}
                    onChange={(e) => setJobForm({ ...jobForm, salaryRange: e.target.value })}
                    className="w-full border border-gray-250 rounded-xl px-3 py-2 text-xs font-semibold bg-white"
                    placeholder="e.g. ₹50,000 - ₹80,000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Job Description</label>
                <textarea
                  rows={4}
                  value={jobForm.description}
                  onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
                  className="w-full border border-gray-250 rounded-xl px-3 py-2 text-xs font-semibold bg-white min-h-[80px]"
                  placeholder="Outline roles and responsibilities..."
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Requirements</label>
                <textarea
                  rows={3}
                  value={jobForm.requirements}
                  onChange={(e) => setJobForm({ ...jobForm, requirements: e.target.value })}
                  className="w-full border border-gray-250 rounded-xl px-3 py-2 text-xs font-semibold bg-white min-h-[60px]"
                  placeholder="Skillsets, education, experience years..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Status</label>
                  <select
                    value={jobForm.status}
                    onChange={(e) => setJobForm({ ...jobForm, status: e.target.value })}
                    className="w-full border border-gray-255 rounded-xl px-3 py-2 text-xs font-semibold bg-white cursor-pointer"
                  >
                    <option value="Active">Active</option>
                    <option value="Draft">Draft</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setJobModalOpen(false)}
                  className="flex-1 border border-gray-250 text-gray-700 py-2.5 rounded-xl text-xs font-bold hover:bg-gray-100 cursor-pointer text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl text-xs font-bold shadow-md shadow-indigo-600/10 cursor-pointer text-center"
                >
                  {editingJob ? "Save Changes" : "Post Vacancy"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CANDIDATE EVALUATION MODAL (ATS DETAILS) */}
      {candidateModalOpen && selectedApplication && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl border border-gray-100 overflow-hidden flex flex-col animate-fade-in max-h-[90vh] overflow-y-auto">
            
            <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-extrabold text-gray-955">Candidate Profile Review</h2>
                <p className="text-gray-500 text-xs mt-0.5">Audit candidate pipeline stage, log interview times, and document feedback</p>
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
              {/* Profile details block */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 border border-slate-150 p-4 rounded-2xl text-left">
                <div className="space-y-1">
                  <span className="text-[9px] text-gray-400 font-bold uppercase block">Candidate Name</span>
                  <span className="text-sm font-bold text-gray-900 block">{selectedApplication.candidateName}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] text-gray-400 font-bold uppercase block">Applied Position</span>
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

              {/* HIRE & PROVISION DOCK */}
              {selectedApplication.status === "Hired" && (
                <div className="bg-emerald-50 border border-emerald-250 p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 text-left">
                  <div className="space-y-1 max-w-md">
                    <h4 className="text-xs font-black text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                      <UserCheck className="w-4 h-4" />
                      Candidate Hired Successfully
                    </h4>
                    <p className="text-[10px] text-emerald-700 font-semibold leading-relaxed">
                      This candidate is marked as **Hired**. You can instantly onboard them as an active employee within the workspace with a single click.
                    </p>
                  </div>
                  <button
                    onClick={() => handleOpenProvisionModal(selectedApplication)}
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all active:scale-[0.98] shadow-md shadow-emerald-600/10 cursor-pointer flex items-center gap-1 shrink-0"
                  >
                    <UserPlus className="w-4 h-4" />
                    Hire & Provision
                  </button>
                </div>
              )}

              {/* Status Update / Interview Scheduling form */}
              <form onSubmit={handleApplicationUpdate} className="space-y-4 text-left border-t border-gray-100 pt-4">
                <h3 className="text-xs font-black text-gray-800 uppercase tracking-wider">Evaluation & Pipeline Controls</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider">Pipeline Stage</label>
                    <select
                      value={candidateForm.status}
                      onChange={(e) => setCandidateForm({ ...candidateForm, status: e.target.value })}
                      className="w-full border border-gray-255 bg-white rounded-xl px-3 py-2 text-xs font-semibold cursor-pointer"
                    >
                      {pipelineStatuses.map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider">Schedule Interview Date & Time</label>
                    <input
                      type="datetime-local"
                      value={candidateForm.interviewDate}
                      onChange={(e) => setCandidateForm({ ...candidateForm, interviewDate: e.target.value })}
                      className="w-full border border-gray-250 bg-white rounded-xl px-3 py-2 text-xs font-semibold cursor-pointer"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider">Interview notes & Evaluation feedback</label>
                  <textarea
                    rows={4}
                    value={candidateForm.feedback}
                    onChange={(e) => setCandidateForm({ ...candidateForm, feedback: e.target.value })}
                    className="w-full border border-gray-250 bg-white rounded-xl px-3 py-2 text-xs font-semibold min-h-[80px]"
                    placeholder="Document interview parameters, evaluation marks, background audit reviews..."
                  />
                </div>

                <div className="flex gap-3 pt-4 border-t border-gray-100 justify-between items-center">
                  <button
                    type="button"
                    onClick={() => handleDeleteApplication(selectedApplication._id)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 border border-rose-250 hover:bg-rose-50 rounded-xl text-xs font-bold text-rose-700 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete Applicant
                  </button>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setCandidateModalOpen(false);
                        setSelectedApplication(null);
                      }}
                      className="px-5 py-2 border border-gray-250 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-100 cursor-pointer"
                    >
                      Discard
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/10 cursor-pointer"
                    >
                      Save Parameters
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* PROVISIONING MODAL DIALOG */}
      {provisionOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md border border-gray-100 overflow-hidden flex flex-col animate-fade-in max-h-[90vh] overflow-y-auto">
            
            <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-extrabold text-gray-955">Provision Hired Employee</h2>
                <p className="text-gray-500 text-xs mt-0.5">Create official employee credentials from candidate record</p>
              </div>
              <button 
                onClick={() => setProvisionOpen(false)} 
                className="p-1.5 hover:bg-gray-200 rounded-xl text-gray-400 hover:text-gray-655"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleProvisionSubmit} className="p-6 space-y-4 text-left">
              <div>
                <label className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Full Name</label>
                <input
                  value={provisionForm.name}
                  onChange={(e) => setProvisionForm({ ...provisionForm, name: e.target.value })}
                  className="w-full border border-gray-250 rounded-xl px-3 py-2 text-xs font-semibold bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Corporate Email Address</label>
                <input
                  type="email"
                  value={provisionForm.email}
                  onChange={(e) => setProvisionForm({ ...provisionForm, email: e.target.value })}
                  className="w-full border border-gray-250 rounded-xl px-3 py-2 text-xs font-semibold bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Password Credentials</label>
                <input
                  type="text"
                  value={provisionForm.password}
                  onChange={(e) => setProvisionForm({ ...provisionForm, password: e.target.value })}
                  className="w-full border border-gray-250 rounded-xl px-3 py-2 text-xs font-semibold bg-white font-mono"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Role Type</label>
                  <select
                    value={provisionForm.role}
                    onChange={(e) => setProvisionForm({ ...provisionForm, role: e.target.value })}
                    className="w-full border border-gray-255 rounded-xl px-3 py-2 text-xs font-semibold bg-white cursor-pointer"
                  >
                    <option value="employee">Employee</option>
                    <option value="manager">Manager</option>
                  </select>
                </div>

                {provisionForm.role === "employee" && (
                  <div>
                    <label className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Assign Manager</label>
                    <select
                      value={provisionForm.managerId}
                      onChange={(e) => setProvisionForm({ ...provisionForm, managerId: e.target.value })}
                      className="w-full border border-gray-255 rounded-xl px-3 py-2 text-xs font-semibold bg-white cursor-pointer"
                      required
                    >
                      <option value="">Select manager</option>
                      {managers.map((m) => (
                        <option key={m._id} value={m._id}>{m.name}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Package Salary (Monthly Amount in ₹)</label>
                <input
                  type="number"
                  value={provisionForm.packageSalary}
                  onChange={(e) => setProvisionForm({ ...provisionForm, packageSalary: e.target.value })}
                  className="w-full border border-gray-250 rounded-xl px-3 py-2.5 text-xs font-semibold bg-white font-mono"
                  placeholder="e.g. 50000"
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setProvisionOpen(false)}
                  className="flex-1 border border-gray-250 text-gray-700 py-2.5 rounded-xl text-xs font-bold hover:bg-gray-100 cursor-pointer text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-indigo-650 hover:bg-indigo-700 text-white py-2.5 rounded-xl text-xs font-bold shadow-md shadow-indigo-600/10 cursor-pointer text-center animate-pulse"
                >
                  Onboard Employee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Recruitment;
