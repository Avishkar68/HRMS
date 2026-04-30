import Payroll from "../models/Payroll.model.js";
import Attendance from "../models/Attendance.model.js";
import User from "../models/User.model.js";

/** Get working days in month (exclude Sat=6, Sun=0) */
function getWorkingDaysInMonth(year, month) {
  const y = parseInt(year, 10);
  const m = parseInt(month, 10) - 1;
  const first = new Date(y, m, 1);
  const last = new Date(y, m + 1, 0);
  let count = 0;
  for (let d = new Date(first); d <= last; d.setDate(d.getDate() + 1)) {
    const day = d.getDay();
    if (day !== 0 && day !== 6) count++;
  }
  return count;
}

/** Calculate payment from monthly attendance: (presentDays / workingDays) * monthlyBaseSalary */
export const calculatePayroll = async (req, res) => {
  try {
    const { userId, month, year, monthlyBaseSalary } = req.query;
    if (!userId || !month || monthlyBaseSalary == null)
      return res.status(400).json({ message: "userId, month, monthlyBaseSalary required" });

    let yNum, mStr;
    if (String(month).includes("-")) {
      [yNum, mStr] = String(month).split("-");
      yNum = parseInt(yNum, 10);
      mStr = mStr.padStart(2, "0");
    } else {
      yNum = parseInt(year, 10) || new Date().getFullYear();
      mStr = String(month).padStart(2, "0");
    }
    const monthStr = `${yNum}-${mStr}`;
    const start = `${monthStr}-01`;
    const lastDay = new Date(yNum, parseInt(mStr, 10), 0).getDate();
    const end = `${monthStr}-${String(lastDay).padStart(2, "0")}`;

    const workingDays = getWorkingDaysInMonth(yNum, mStr);
    const presentCount = await Attendance.countDocuments({
      companyId: req.user.companyId,
      userId,
      date: { $gte: start, $lte: end },
    });

    const base = Number(monthlyBaseSalary) || 0;
    const calculatedBaseAmount = workingDays > 0
      ? Math.round((presentCount / workingDays) * base)
      : 0;

    res.json({
      presentDays: presentCount,
      workingDays,
      monthlyBaseSalary: base,
      calculatedBaseAmount,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPayrollList = async (req, res) => {
  try {
    const { month, year, userId } = req.query;
    const filter = { companyId: req.user.companyId };
    if (month) filter.month = month;
    if (year) filter.year = parseInt(year, 10);
    if (userId) filter.userId = userId;

    const payrolls = await Payroll.find(filter)
      .populate("userId", "name email role")
      .sort({ year: -1, month: -1 })
      .lean();
    res.json(payrolls);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createPayroll = async (req, res) => {
  try {
    const { userId, month, year, baseSalary, allowances, deductions } = req.body;
    if (!userId || !month || !year || baseSalary == null)
      return res.status(400).json({ message: "userId, month, year, baseSalary required" });

    const y = parseInt(year, 10);
    const allow = allowances || 0;
    const deduct = deductions || 0;
    const net = Number(baseSalary) + allow - deduct;

    const exists = await Payroll.findOne({
      companyId: req.user.companyId,
      userId,
      month,
      year: y,
    });
    if (exists) return res.status(400).json({ message: "Payroll for this user/month already exists" });

    const payroll = await Payroll.create({
      companyId: req.user.companyId,
      userId,
      month,
      year: y,
      baseSalary: Number(baseSalary),
      allowances: allow,
      deductions: deduct,
      netSalary: net,
      status: "draft",
    });
    const populated = await Payroll.findById(payroll._id).populate("userId", "name email").lean();
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMyPayslips = async (req, res) => {
  try {
    const payrolls = await Payroll.find({
      companyId: req.user.companyId,
      userId: req.user.id,
    })
      .sort({ year: -1, month: -1 })
      .lean();
    res.json(payrolls);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updatePayrollStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!["draft", "processed", "paid"].includes(status))
      return res.status(400).json({ message: "Invalid status" });

    const payroll = await Payroll.findOne({
      _id: id,
      companyId: req.user.companyId,
    });
    if (!payroll) return res.status(404).json({ message: "Payroll not found" });
    payroll.status = status;
    if (status === "paid") payroll.paidAt = new Date();
    await payroll.save();
    res.json(payroll);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
