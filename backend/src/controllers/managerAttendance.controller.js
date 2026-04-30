import Attendance from "../models/Attendance.model.js";
import Leave from "../models/Leave.model.js";
import User from "../models/User.model.js";
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

/* ================= DASHBOARD STATS ================= */
export const getDashboardStats = async (req, res) => {
  try {
    const companyId = req.user.companyId;
    const managerId = req.user.id;
    const today = getLocalDateString();

    const teamMembers = await User.find({ companyId, managerId }).select("_id");
    const teamCount = teamMembers.length;
    const userIds = teamMembers.map((u) => u._id);

    const presentToday = await Attendance.countDocuments({
      companyId,
      userId: { $in: userIds },
      date: today,
    });

    const pendingLeaves = await Leave.countDocuments({
      companyId,
      managerId,
      status: "pending",
    });

    res.json({
      teamCount,
      presentToday,
      pendingLeaves,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= TODAY TEAM ATTENDANCE ================= */
/* ================= TODAY TEAM ATTENDANCE ================= */
export const getTodayTeamAttendance = async (req, res) => {
  try {
    const companyId = req.user.companyId;
    const managerId = req.user.id;
    const today = getLocalDateString(); // STRING YYYY-MM-DD

    const team = await User.find({ companyId, managerId })
      .select("_id name");

    const userIds = team.map(u => u._id);

    const attendance = await Attendance.find({
      companyId,
      userId: { $in: userIds },
      date: today
    });

    const leaves = await Leave.find({
      companyId,
      userId: { $in: userIds },
      status: "approved",
      fromDate: { $lte: today },
      toDate: { $gte: today }
    });

    const attendanceMap = {};
    attendance.forEach(a => {
      attendanceMap[a.userId.toString()] = a;
    });

    const leaveSet = new Set(
      leaves.map(l => l.userId.toString())
    );

    const result = team.map(u => {
      const uid = u._id.toString();

      if (leaveSet.has(uid)) {
        return {
          userId: u._id,
          name: u.name,
          status: "on_leave"
        };
      }

      const a = attendanceMap[uid];
      if (!a) {
        return {
          userId: u._id,
          name: u.name,
          status: "absent"
        };
      }

      return {
        userId: u._id,
        name: u.name,
        status: a.status,
        checkInTime: a.checkInTime,
        checkOutTime: a.checkOutTime
      };
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


/* ================= EMPLOYEE MONTH ATTENDANCE ================= */
/* ================= EMPLOYEE MONTH ATTENDANCE ================= */
export const getEmployeeMonthAttendance = async (req, res) => {
  try {
    const { userId } = req.params;
    const { month } = req.query;
    const companyId = req.user.companyId;

    const start = `${month}-01`;
    const end = `${month}-31`;

    const attendance = await Attendance.find({
      companyId,
      userId,
      date: { $gte: start, $lte: end }
    });

    const leaves = await Leave.find({
      companyId,
      userId,
      status: "approved",
      fromDate: { $lte: end },
      toDate: { $gte: start }
    });

    const attendanceMap = {};
    attendance.forEach(a => {
      attendanceMap[a.date] = a.status;
    });

    const leaveMap = {};

    leaves.forEach(l => {
      let d = l.fromDate;
      while (d <= l.toDate) {
        leaveMap[d] = true;

        const dt = new Date(d);
        dt.setDate(dt.getDate() + 1);
        d = dt.toISOString().split("T")[0];
      }
    });

    const [year, m] = month.split("-");
    const daysInMonth = new Date(year, m, 0).getDate();

    const result = [];

    for (let i = 1; i <= daysInMonth; i++) {
      const date = `${month}-${String(i).padStart(2, "0")}`;

      if (leaveMap[date]) {
        result.push({ date, status: "on_leave" });
      } else if (attendanceMap[date]) {
        result.push({ date, status: attendanceMap[date] });
      } else {
        result.push({ date, status: "absent" });
      }
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

