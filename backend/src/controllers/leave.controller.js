import Leave from "../models/Leave.model.js";
import User from "../models/User.model.js";
import LeaveBalance from "../models/LeaveBalance.model.js";

export const applyLeave = async (req, res) => {
  try {
    const { leaveTypeId, fromDate, toDate, reason } = req.body;

    if (!leaveTypeId || !fromDate || !toDate) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // get logged-in user (for managerId)
    const user = await User.findById(req.user.id);

    if (!user.managerId) {
      return res.status(400).json({
        message: "No manager assigned. Contact admin."
      });
    }

    const from = new Date(fromDate);
    const to = new Date(toDate);

    const totalDays =
      Math.ceil((to - from) / (1000 * 60 * 60 * 24)) + 1;

    if (totalDays <= 0) {
      return res.status(400).json({ message: "Invalid date range" });
    }

    // ✅ CHECK LEAVE BALANCE
    const balance = await LeaveBalance.findOne({
      companyId: req.user.companyId,
      userId: req.user.id,
      leaveTypeId,
      year: new Date().getFullYear()
    });

    if (!balance || balance.remaining < totalDays) {
      return res.status(400).json({
        message: "Insufficient leave balance"
      });
    }

    const leave = await Leave.create({
      companyId: req.user.companyId,
      userId: req.user.id,
      managerId: user.managerId,
      leaveTypeId,          // ✅ NEW
      fromDate,
      toDate,
      totalDays,
      reason,
      status: "pending"
    });

    res.status(201).json({
      message: "Leave applied successfully",
      leave
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const getMyLeaves = async (req, res) => {
  const leaves = await Leave.find({
    companyId: req.user.companyId,
    userId: req.user.id
  }).sort({ createdAt: -1 });

  res.json(leaves);
};
