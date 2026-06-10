import Appraisal from "../models/Appraisal.model.js";
import User from "../models/User.model.js";

// Create performance review (Manager only)
export const createAppraisal = async (req, res) => {
  try {
    const { userId, period, ratings, managerFeedback } = req.body;
    const companyId = req.user.companyId;
    const managerId = req.user.id;

    if (!userId || !period || !ratings || !managerFeedback) {
      return res.status(400).json({ message: "Employee, review period, ratings, and manager feedback are required" });
    }

    // Verify target employee reports to this manager
    const employee = await User.findOne({ _id: userId, companyId, status: "active" });
    if (!employee) {
      return res.status(400).json({ message: "Invalid or inactive employee selected" });
    }

    if (!employee.managerId || employee.managerId.toString() !== managerId) {
      return res.status(403).json({ message: "You can only conduct performance reviews for employees reporting to you" });
    }

    // Validate ratings fields are between 1 and 5
    const { performance, communication, teamwork, punctuality } = ratings;
    if (
      performance < 1 || performance > 5 ||
      communication < 1 || communication > 5 ||
      teamwork < 1 || teamwork > 5 ||
      punctuality < 1 || punctuality > 5
    ) {
      return res.status(400).json({ message: "Ratings must be numeric values between 1 and 5 stars" });
    }

    const appraisal = await Appraisal.create({
      companyId,
      userId,
      managerId,
      period,
      ratings: { performance, communication, teamwork, punctuality },
      managerFeedback,
      status: "pending-employee-feedback"
    });

    const populated = await Appraisal.findById(appraisal._id)
      .populate("userId", "name email role")
      .populate("managerId", "name email role")
      .lean();

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get reviews (Employee, Manager, Admin)
export const getAppraisals = async (req, res) => {
  try {
    const companyId = req.user.companyId;
    const userId = req.user.id;
    const role = req.user.role;

    let query = { companyId };

    if (role === "employee") {
      query.userId = userId;
    } else if (role === "manager") {
      const team = await User.find({ companyId, managerId: userId }).select("_id");
      const teamIds = team.map(u => u._id);
      
      query.$or = [
        { managerId: userId },
        { userId: { $in: teamIds } }
      ];
    } // Admin gets all reviews in company

    const appraisals = await Appraisal.find(query)
      .populate("userId", "name email role")
      .populate("managerId", "name email role")
      .sort({ createdAt: -1 })
      .lean();

    res.json(appraisals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Submit self-evaluation (Employee only)
export const submitSelfEvaluation = async (req, res) => {
  try {
    const { id } = req.params;
    const { selfEvaluation } = req.body;
    const companyId = req.user.companyId;
    const userId = req.user.id;

    if (!selfEvaluation || !selfEvaluation.trim()) {
      return res.status(400).json({ message: "Self-evaluation comment is required" });
    }

    const appraisal = await Appraisal.findOne({ _id: id, companyId, userId });
    if (!appraisal) {
      return res.status(404).json({ message: "Appraisal record not found" });
    }

    if (appraisal.status !== "pending-employee-feedback") {
      return res.status(400).json({ message: "Self-evaluation has already been submitted for this review cycle" });
    }

    appraisal.selfEvaluation = selfEvaluation;
    appraisal.status = "completed";

    await appraisal.save();

    const populated = await Appraisal.findById(appraisal._id)
      .populate("userId", "name email role")
      .populate("managerId", "name email role")
      .lean();

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete review
export const deleteAppraisal = async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = req.user.companyId;
    const userId = req.user.id;
    const role = req.user.role;

    const appraisal = await Appraisal.findOne({ _id: id, companyId });
    if (!appraisal) {
      return res.status(404).json({ message: "Appraisal record not found" });
    }

    // Admins can delete any, managers can delete only those they initiated
    if (role === "admin" || (role === "manager" && appraisal.managerId.toString() === userId)) {
      await Appraisal.deleteOne({ _id: id });
      return res.json({ message: "Appraisal record deleted successfully" });
    }

    res.status(403).json({ message: "Access denied" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
