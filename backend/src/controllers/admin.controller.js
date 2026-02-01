import bcrypt from "bcryptjs";
import User from "../models/User.model.js";
import LeaveType from "../models/LeaveType.model.js";
import LeaveBalance from "../models/LeaveBalance.model.js";

export const createUser = async (req, res) => {
  try {
    const { name, email, password, role, managerId } = req.body;

    // ❌ Prevent admin creation
    if (role === "admin") {
      return res.status(400).json({ message: "Cannot create admin" });
    }

    // ❌ Employee must have manager
    if (role === "employee" && !managerId) {
      return res.status(400).json({
        message: "Manager is required for employee"
      });
    }

    // ✅ Validate manager
    if (managerId) {
      const manager = await User.findOne({
        _id: managerId,
        role: "manager",
        companyId: req.user.companyId
      });

      if (!manager) {
        return res.status(400).json({
          message: "Invalid manager selected"
        });
      }
    }

    // ❌ Duplicate email
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // ✅ Create user
    const user = await User.create({
      companyId: req.user.companyId,
      name,
      email,
      passwordHash,
      role,
      managerId: role === "employee" ? managerId : null,
      status: "active"
    });

    // ===============================
    // 🔥 AUTO CREATE LEAVE BALANCE
    // ===============================
    if (role === "employee") {
      const leaveTypes = await LeaveType.find({
        companyId: req.user.companyId
      });

      const year = new Date().getFullYear();

      const balances = leaveTypes.map(type => ({
        companyId: req.user.companyId,
        userId: user._id,                // ✅ FIXED
        leaveTypeId: type._id,
        year,
        total: type.yearlyQuota,
        used: 0,
        remaining: type.yearlyQuota
      }));

      if (balances.length > 0) {
        await LeaveBalance.insertMany(balances);
      }
    }

    res.status(201).json({
      message: "User created successfully",
      userId: user._id
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
