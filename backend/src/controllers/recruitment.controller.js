import RecruitmentJob from "../models/RecruitmentJob.model.js";
import RecruitmentApplication from "../models/RecruitmentApplication.model.js";
import User from "../models/User.model.js";

// ================= JOBS CONTROLLER =================

export const getJobs = async (req, res) => {
  try {
    let companyId;
    let query = {};

    // Check if it is a public unauthenticated request
    if (req.params.companyId) {
      companyId = req.params.companyId;
      query = { companyId, status: "Active" };
    } else {
      companyId = req.user.companyId;
      query = { companyId };
    }

    const jobs = await RecruitmentJob.find(query)
      .populate("departmentId", "name code")
      .sort({ createdAt: -1 })
      .lean();

    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createJob = async (req, res) => {
  try {
    const { title, departmentId, location, type, description, requirements, salaryRange, status } = req.body;
    if (!title || !departmentId || !description) {
      return res.status(400).json({ message: "Title, Department and Description are required" });
    }

    const job = await RecruitmentJob.create({
      companyId: req.user.companyId,
      title,
      departmentId,
      location: location || "Remote",
      type: type || "Full-time",
      description,
      requirements: requirements || "",
      salaryRange: salaryRange || "",
      status: status || "Active"
    });

    const populated = await RecruitmentJob.findById(job._id).populate("departmentId", "name code").lean();
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateJob = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, departmentId, location, type, description, requirements, salaryRange, status } = req.body;

    const job = await RecruitmentJob.findOne({ _id: id, companyId: req.user.companyId });
    if (!job) {
      return res.status(404).json({ message: "Job posting not found" });
    }

    if (title) job.title = title;
    if (departmentId) job.departmentId = departmentId;
    if (location !== undefined) job.location = location;
    if (type) job.type = type;
    if (description) job.description = description;
    if (requirements !== undefined) job.requirements = requirements;
    if (salaryRange !== undefined) job.salaryRange = salaryRange;
    if (status) job.status = status;

    await job.save();

    const populated = await RecruitmentJob.findById(job._id).populate("departmentId", "name code").lean();
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteJob = async (req, res) => {
  try {
    const { id } = req.params;

    const job = await RecruitmentJob.findOneAndDelete({ _id: id, companyId: req.user.companyId });
    if (!job) {
      return res.status(404).json({ message: "Job posting not found" });
    }

    // Proactively clean up all candidate applications associated with this job posting
    await RecruitmentApplication.deleteMany({ jobId: id });

    res.json({ message: "Job posting and all associated candidate applications deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= APPLICATIONS CONTROLLER =================

export const getApplications = async (req, res) => {
  try {
    const companyId = req.user.companyId;
    const query = { companyId };

    const applications = await RecruitmentApplication.find(query)
      .populate({
        path: "jobId",
        populate: { path: "departmentId", select: "name code" }
      })
      .sort({ createdAt: -1 })
      .lean();

    // Managers only see candidates applying to departments they manage
    let result = applications;
    if (req.user.role === "manager") {
      const managerUser = await User.findById(req.user.id);
      if (managerUser && managerUser.departmentId) {
        result = applications.filter(app => 
          app.jobId && 
          app.jobId.departmentId && 
          String(app.jobId.departmentId._id) === String(managerUser.departmentId)
        );
      } else {
        result = []; // If manager doesn't manage a department, they see nothing
      }
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const applyJob = async (req, res) => {
  try {
    const { jobId, candidateName, candidateEmail, candidatePhone, resumeUrl } = req.body;
    if (!jobId || !candidateName || !candidateEmail) {
      return res.status(400).json({ message: "Job ID, Name, and Email are required" });
    }

    // Resolve companyId: can be public payload or protected session
    let companyId;
    if (req.user) {
      companyId = req.user.companyId;
    } else {
      // Find the job opening to resolve company ID
      const targetJob = await RecruitmentJob.findById(jobId);
      if (!targetJob) {
        return res.status(404).json({ message: "Job opening not found" });
      }
      if (targetJob.status !== "Active") {
        return res.status(400).json({ message: "This job position is no longer active" });
      }
      companyId = targetJob.companyId;
    }

    const application = await RecruitmentApplication.create({
      companyId,
      jobId,
      candidateName,
      candidateEmail,
      candidatePhone: candidatePhone || "",
      resumeUrl: resumeUrl || "",
      status: "Applied"
    });

    const populated = await RecruitmentApplication.findById(application._id)
      .populate({
        path: "jobId",
        populate: { path: "departmentId", select: "name code" }
      })
      .lean();

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, interviewDate, feedback } = req.body;

    const application = await RecruitmentApplication.findOne({ _id: id, companyId: req.user.companyId });
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    if (status) application.status = status;
    if (interviewDate !== undefined) application.interviewDate = interviewDate ? new Date(interviewDate) : null;
    if (feedback !== undefined) application.feedback = feedback;

    await application.save();

    const populated = await RecruitmentApplication.findById(application._id)
      .populate({
        path: "jobId",
        populate: { path: "departmentId", select: "name code" }
      })
      .lean();

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteApplication = async (req, res) => {
  try {
    const { id } = req.params;

    const application = await RecruitmentApplication.findOneAndDelete({ _id: id, companyId: req.user.companyId });
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    res.json({ message: "Candidate application deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
