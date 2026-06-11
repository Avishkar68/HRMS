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
      adminPassword,
      plan,
      status
    } = req.body;

    // 1. Create Company
    const company = await Company.create({
      name: companyName,
      domain,
      plan: plan || "basic",
      status: status || "active"
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

/* ================= UPDATE COMPANY ================= */
export const updateCompany = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, domain, plan, status } = req.body;

    const company = await Company.findById(id);
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    if (name !== undefined) company.name = name;
    if (domain !== undefined) company.domain = domain;
    if (plan !== undefined) {
      if (!["basic", "premium"].includes(plan)) {
        return res.status(400).json({ message: "Invalid plan type" });
      }
      company.plan = plan;
    }
    if (status !== undefined) {
      if (!["active", "inactive"].includes(status)) {
        return res.status(400).json({ message: "Invalid status type" });
      }
      company.status = status;
    }

    await company.save();
    res.json({ message: "Company updated successfully", company });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
