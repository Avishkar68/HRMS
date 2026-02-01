import Attendance from "../models/Attendance.model.js";
import Leave from "../models/Leave.model.js";
const getTodayString = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString().split("T")[0];
};
const getLocalDateString = () => {
  const now = new Date();
  const offsetMs = now.getTimezoneOffset() * 60000;
  return new Date(now - offsetMs).toISOString().split("T")[0];
};

/* ================= CHECK IN ================= */
export const checkIn = async (req, res) => {
  try {
    const { lat, lng, accuracy } = req.body;
    const today = getLocalDateString();

    const existing = await Attendance.findOne({
      companyId: req.user.companyId,
      userId: req.user.id,
      date: today
    });

    if (existing) {
      return res.status(400).json({ message: "Already checked in today" });
    }

    const attendance = await Attendance.create({
      companyId: req.user.companyId,
      userId: req.user.id,
      date: today,
      checkInTime: new Date().toLocaleTimeString(),
      status: "present",
      location: lat ? { lat, lng, accuracy } : null
    });

    res.json({ message: "Checked in successfully", attendance });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


/* ================= CHECK OUT ================= */
export const checkOut = async (req, res) => {
  try {
    const today = getLocalDateString();

    const attendance = await Attendance.findOne({
      companyId: req.user.companyId,
      userId: req.user.id,
      date: today
    });

    if (!attendance) {
      return res.status(400).json({ message: "No check-in found" });
    }

    if (attendance.checkOutTime) {
      return res.status(400).json({ message: "Already checked out" });
    }

    attendance.checkOutTime = new Date().toLocaleTimeString();
    await attendance.save();

    res.json({ message: "Checked out successfully", attendance });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


/* ================= TODAY STATUS ================= */
export const todayStatus = async (req, res) => {
  try {
    const companyId = req.user.companyId;
    const userId = req.user.id;

    // ✅ ALWAYS STRING YYYY-MM-DD
    const today = new Date();
    const offsetMs = today.getTimezoneOffset() * 60000;
    const todayStr = new Date(today - offsetMs)
      .toISOString()
      .split("T")[0];

    /* 1️⃣ CHECK LEAVE (STRING vs STRING) */
    const leave = await Leave.findOne({
      companyId,
      userId,
      status: "approved",
      fromDate: { $lte: todayStr },
      toDate: { $gte: todayStr }
    });

    if (leave) {
      return res.json({
        status: "on_leave",
        date: todayStr
      });
    }

    /* 2️⃣ CHECK ATTENDANCE */
    const attendance = await Attendance.findOne({
      companyId,
      userId,
      date: todayStr
    });
console.log("AUTH USER:", req.user);

    return res.json(attendance || null);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};






export const getAttendanceHistory = async (req, res) => {
  try {
    const { month } = req.query;
    if (!month) return res.status(400).json({ message: "Month required" });

    const start = `${month}-01`;
    const end = `${month}-31`;

    const attendance = await Attendance.find({
      companyId: req.user.companyId,
      userId: req.user.id,
      date: { $gte: start, $lte: end }
    }).lean();

    const leaves = await Leave.find({
      companyId: req.user.companyId,
      userId: req.user.id,
      status: "approved",
      fromDate: { $lte: end },
      toDate: { $gte: start }
    }).lean();

    res.json({ attendance, leaves });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
