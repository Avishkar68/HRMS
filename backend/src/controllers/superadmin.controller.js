import Company from "../models/Company.model.js";
import User from "../models/User.model.js";
import Attendance from "../models/Attendance.model.js";
import Leave from "../models/Leave.model.js";
import bcrypt from "bcryptjs";

/* ================= LIST COMPANIES ================= */
export const getCompanies = async (req, res) => {
  try {
    const companies = await Company.find().sort({ createdAt: -1 }).lean();
    res.json(companies);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================= USAGE STATUS (PER COMPANY) ================= */
export const getUsage = async (req, res) => {
  try {
    const companies = await Company.find().select("_id name plan status").lean();
    const result = await Promise.all(
      companies.map(async (c) => {
        const [userCount, attendanceCount, leaveCount] = await Promise.all([
          User.countDocuments({ companyId: c._id }),
          Attendance.countDocuments({ companyId: c._id }),
          Leave.countDocuments({ companyId: c._id }),
        ]);
        return {
          companyId: c._id,
          companyName: c.name,
          plan: c.plan || "basic",
          status: c.status || "active",
          users: userCount,
          attendanceRecords: attendanceCount,
          leaveRequests: leaveCount,
        };
      })
    );
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

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
