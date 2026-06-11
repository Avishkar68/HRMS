import bcrypt from "bcryptjs";
import User from "../models/User.model.js";
import LeaveType from "../models/LeaveType.model.js";
import LeaveBalance from "../models/LeaveBalance.model.js";
import Leave from "../models/Leave.model.js";
import Attendance from "../models/Attendance.model.js";
import Department from "../models/Department.model.js";

const getLocalDateString = () => {
  const now = new Date();
  const offsetMs = now.getTimezoneOffset() * 60000;
  return new Date(now - offsetMs).toISOString().split("T")[0];
};

export const getDashboardStats = async (req, res) => {
  try {
    const companyId = req.user.companyId;
    const today = getLocalDateString();
    const [userCount, pendingLeaves, presentToday, managerCount, employeeCount] = await Promise.all([
      User.countDocuments({ companyId }),
      Leave.countDocuments({ companyId, status: "pending" }),
      Attendance.countDocuments({ companyId, date: today }),
      User.countDocuments({ companyId, role: "manager" }),
      User.countDocuments({ companyId, role: "employee" }),
    ]);
    res.json({
      userCount,
      pendingLeaves,
      presentToday,
      managerCount,
      employeeCount,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUsers = async (req, res) => {
  try {
    const users = await User.find({ companyId: req.user.companyId })
      .select("-passwordHash")
      .populate("departmentId", "name code")
      .sort({ createdAt: -1 })
      .lean();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createUser = async (req, res) => {
  try {
    const { name, email, password, role, managerId, packageSalary } = req.body;

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
    let resolvedDeptId = null;
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

      // Resolve department from manager record or fallback to department head lookup
      resolvedDeptId = manager.departmentId || null;
      if (!resolvedDeptId) {
        const managerDept = await Department.findOne({ headId: managerId, companyId: req.user.companyId });
        if (managerDept) {
          resolvedDeptId = managerDept._id;
          // Sync manager's departmentId in database
          await User.updateOne({ _id: managerId }, { $set: { departmentId: resolvedDeptId } });
        }
      }
    }

    // ❌ Duplicate email (per company)
    const exists = await User.findOne({ companyId: req.user.companyId, email });
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
      departmentId: role === "employee" ? resolvedDeptId : null,
      packageSalary: Number(packageSalary) || 0,
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

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, managerId, packageSalary, status } = req.body;

    const user = await User.findOne({ _id: id, companyId: req.user.companyId });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (name) user.name = name;
    if (email) user.email = email;
    if (status) user.status = status;
    if (packageSalary !== undefined) user.packageSalary = Number(packageSalary) || 0;
    if (role && role !== "admin") user.role = role;
    if (managerId !== undefined) {
      const oldManagerId = user.managerId;
      user.managerId = role === "employee" ? managerId : null;
      
      if (role === "employee" && managerId) {
        if (String(oldManagerId) !== String(managerId)) {
          // Resolve new manager's department
          const manager = await User.findOne({ _id: managerId, role: "manager", companyId: req.user.companyId });
          if (manager) {
            let resolvedDeptId = manager.departmentId || null;
            if (!resolvedDeptId) {
              const managerDept = await Department.findOne({ headId: managerId, companyId: req.user.companyId });
              if (managerDept) {
                resolvedDeptId = managerDept._id;
                await User.updateOne({ _id: managerId }, { $set: { departmentId: resolvedDeptId } });
              }
            }
            user.departmentId = resolvedDeptId;
          }
        }
      } else {
        user.departmentId = null;
      }
    }

    await user.save();
    res.json({ message: "User updated successfully", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
