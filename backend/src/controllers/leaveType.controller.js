import LeaveType from "../models/LeaveType.model.js";
import LeaveBalance from "../models/LeaveBalance.model.js";
import User from "../models/User.model.js";

/* ================= CREATE LEAVE TYPE ================= */
export const createLeaveType = async (req, res) => {
  try {
    const { name, yearlyQuota } = req.body;

    if (!name || !yearlyQuota) {
      return res.status(400).json({ message: "All fields required" });
    }

    const exists = await LeaveType.findOne({
      companyId: req.user.companyId,
      name
    });

    if (exists) {
      return res.status(400).json({ message: "Leave type already exists" });
    }

    const leaveType = await LeaveType.create({
      companyId: req.user.companyId,
      name,
      yearlyQuota
    });

    // 🔥 create balance for all employees
    const employees = await User.find({
      companyId: req.user.companyId,
      role: "employee"
    });

    const year = new Date().getFullYear();

    const balances = employees.map((emp) => ({
      companyId: req.user.companyId,
      userId: emp._id,
      leaveTypeId: leaveType._id,
      year,
      total: yearlyQuota,
      remaining: yearlyQuota
    }));

    if (balances.length) {
      await LeaveBalance.insertMany(balances);
    }

    res.status(201).json({
      message: "Leave type created",
      leaveType
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================= GET LEAVE TYPES ================= */
export const getLeaveTypes = async (req, res) => {
  try {
    const types = await LeaveType.find({
      companyId: req.user.companyId
    });

    res.json(types);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
