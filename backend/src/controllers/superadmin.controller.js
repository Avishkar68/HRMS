import Company from "../models/Company.model.js";
import User from "../models/User.model.js";
import bcrypt from "bcryptjs";

/* ================= CREATE COMPANY + ADMIN ================= */
export const createCompany = async (req, res) => {
  try {
    const { 
      companyName,
      domain,
      adminName,
      adminEmail,
      adminPassword
    } = req.body;

    // 1. Create Company
    const company = await Company.create({
      name: companyName,
      domain
    });

    // 2. Create Company Admin
    const passwordHash = await bcrypt.hash(adminPassword, 10);

    const adminUser = await User.create({
      companyId: company._id,
      name: adminName,
      email: adminEmail,
      passwordHash,
      role: "admin",
      status: "active"
    });

    res.status(201).json({
      message: "Company created successfully",
      companyId: company._id,
      adminUserId: adminUser._id
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
