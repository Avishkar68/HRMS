import bcrypt from "bcryptjs";
import User from "../models/User.model.js";
import SuperAdmin from "../models/SuperAdmin.model.js";
import { generateToken } from "../utils/jwt.js";

/* ================= GET CURRENT USER (EMPLOYEE/MANAGER/ADMIN) ================= */
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select("-passwordHash")
      .populate("managerId", "name email")
      .lean();
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================= USER LOGIN ================= */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(401).json({ message: "Invalid credentials" });

    if (user.status !== "active")
      return res.status(403).json({ message: "Account inactive" });

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials" });

    const role = (user.role || "").toString().toLowerCase();
    const token = generateToken({
      id: user._id,
      role,
      companyId: user.companyId
    });

    res.json({
      token,
      user: {
        id: user._id,
        role,
        companyId: user.companyId
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================= SUPER ADMIN LOGIN ================= */
export const superAdminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await SuperAdmin.findOne({ email });
    if (!admin)
      return res.status(401).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, admin.passwordHash);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials" });

    const token = generateToken({
      id: admin._id,
      role: "superadmin"
    });

    res.json({
      token,
      user: {
        id: admin._id,
        role: "superadmin"
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
