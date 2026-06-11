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
      .populate("departmentId", "name code")
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

    console.log(`[LOGIN DEBUG] Incoming email: ${JSON.stringify(email)}, password length: ${password?.length}`);
    if (password) {
      const charCodes = [];
      for (let i = 0; i < password.length; i++) {
        charCodes.push(password.charCodeAt(i));
      }
      console.log(`[LOGIN DEBUG] Password char codes:`, charCodes);
    }

    const user = await User.findOne({ email });
    if (!user) {
      console.log(`[LOGIN DEBUG] User not found for email: ${email}`);
      return res.status(401).json({ message: "Invalid credentials" });
    }

    console.log(`[LOGIN DEBUG] Found user: ${user.name}, role: ${user.role}, hash: ${user.passwordHash}`);

    if (user.status !== "active") {
      console.log(`[LOGIN DEBUG] User status is inactive: ${user.status}`);
      return res.status(403).json({ message: "Account inactive" });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    console.log(`[LOGIN DEBUG] bcrypt.compare match result: ${isMatch}`);

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

/* ================= CHANGE PASSWORD ================= */
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current and new passwords are required" });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect current password" });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    user.passwordHash = hashed;
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================= UPDATE PROFILE (INCLUDING BANK DETAILS) ================= */
export const updateProfile = async (req, res) => {
  try {
    const { name, bankDetails } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (name) user.name = name;
    if (bankDetails) {
      user.bankDetails = {
        bankName: bankDetails.bankName || "",
        accountNumber: bankDetails.accountNumber || "",
        ifscCode: bankDetails.ifscCode || "",
        accountHolderName: bankDetails.accountHolderName || "",
        branchName: bankDetails.branchName || ""
      };
    }

    await user.save();

    const populated = await User.findById(user._id)
      .select("-passwordHash")
      .populate("managerId", "name email")
      .populate("departmentId", "name code")
      .lean();

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


