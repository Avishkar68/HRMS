import Timesheet from "../models/Timesheet.model.js";
import User from "../models/User.model.js";

// Log work hours
export const createTimesheet = async (req, res) => {
  try {
    const { date, hours, project, description } = req.body;
    const companyId = req.user.companyId;
    const userId = req.user.id;

    if (!date || !hours) {
      return res.status(400).json({ message: "Date and hours are required" });
    }

    // Resolve user's manager
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const timesheet = await Timesheet.create({
      companyId,
      userId,
      managerId: user.managerId || null,
      date,
      hours,
      project: project || "General",
      description: description || "",
      status: "pending"
    });

    const populated = await Timesheet.findById(timesheet._id)
      .populate("userId", "name email role")
      .lean();

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get timesheets
export const getTimesheets = async (req, res) => {
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
        { userId: userId },
        { userId: { $in: teamIds } }
      ];
    } // Admin sees all logs in company

    const logs = await Timesheet.find(query)
      .populate("userId", "name email role")
      .sort({ date: -1, createdAt: -1 })
      .lean();

    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update timesheet
export const updateTimesheet = async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = req.user.companyId;
    const userId = req.user.id;
    const role = req.user.role;

    const log = await Timesheet.findOne({ _id: id, companyId });
    if (!log) {
      return res.status(404).json({ message: "Timesheet log not found" });
    }

    const isOwnLog = log.userId.toString() === userId;

    if (role === "employee" || (role === "manager" && isOwnLog)) {
      // Employees/Managers modifying their own log: only allowed if status is pending
      if (log.status !== "pending") {
        return res.status(400).json({ message: "Cannot modify approved or rejected timesheets" });
      }

      const { date, hours, project, description, status } = req.body;
      if (status && status !== log.status) {
        return res.status(400).json({ message: "Employees cannot approve or reject their own logs" });
      }

      if (date) log.date = date;
      if (hours) log.hours = hours;
      if (project) log.project = project;
      if (description !== undefined) log.description = description;
    } else if (role === "manager") {
      // Manager approving or rejecting a team log
      const team = await User.find({ companyId, managerId: userId }).select("_id");
      const teamIds = team.map(u => u._id.toString());

      if (!teamIds.includes(log.userId.toString())) {
        return res.status(403).json({ message: "Access denied" });
      }

      const { status, rejectionReason } = req.body;
      if (status) {
        if (!["approved", "rejected"].includes(status)) {
          return res.status(400).json({ message: "Invalid status value" });
        }
        log.status = status;
        if (status === "rejected") {
          log.rejectionReason = rejectionReason || "No comment provided";
        } else {
          log.rejectionReason = "";
        }
      }
    } else if (role === "admin") {
      // Admin can edit anything
      const { date, hours, project, description, status, rejectionReason } = req.body;
      if (date) log.date = date;
      if (hours) log.hours = hours;
      if (project) log.project = project;
      if (description !== undefined) log.description = description;
      if (status) {
        log.status = status;
        if (status === "rejected") log.rejectionReason = rejectionReason || "";
      }
    } else {
      return res.status(403).json({ message: "Access denied" });
    }

    await log.save();

    const populated = await Timesheet.findById(log._id)
      .populate("userId", "name email role")
      .lean();

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete timesheet
export const deleteTimesheet = async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = req.user.companyId;
    const userId = req.user.id;
    const role = req.user.role;

    const log = await Timesheet.findOne({ _id: id, companyId });
    if (!log) {
      return res.status(404).json({ message: "Timesheet log not found" });
    }

    const isOwnLog = log.userId.toString() === userId;

    if (role === "admin" || (isOwnLog && log.status === "pending")) {
      await Timesheet.deleteOne({ _id: id });
      return res.json({ message: "Timesheet log deleted successfully" });
    }

    res.status(453).json({ message: "Access denied. Only pending logs can be deleted." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
