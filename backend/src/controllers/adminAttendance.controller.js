import Attendance from "../models/Attendance.model.js";
import Leave from "../models/Leave.model.js";
import User from "../models/User.model.js";

const getLocalDateString = () => {
  const now = new Date();
  const offsetMs = now.getTimezoneOffset() * 60000;
  return new Date(now - offsetMs).toISOString().split("T")[0];
};
export const getAttendanceList = async (req, res) => {
  try {
    const { date, userId } = req.query;

    const filter = {
      companyId: req.user.companyId
    };

    if (date) filter.date = date;
    if (userId) filter.userId = userId;

    const attendance = await Attendance.find(filter)
      .sort({ date: -1 })
      .lean();

    // attach user info (name, email)
    const userIds = attendance.map(a => a.userId);
    const users = await User.find(
      { _id: { $in: userIds } },
      { name: 1, email: 1 }
    ).lean();

    const userMap = {};
    users.forEach(u => {
      userMap[u._id.toString()] = u;
    });

    const result = attendance.map(a => ({
      ...a,
      user: userMap[a.userId.toString()] || null
    }));

    res.json(result);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



export const getAdminAttendanceGrouped = async (req, res) => {
  try {
    const companyId = req.user.companyId;
    const date = req.query.date || getLocalDateString();

    /* 1️⃣ Get all managers */
    const managers = await User.find({
      companyId,
      role: "manager"
    }).select("_id name");

    /* 2️⃣ Get all employees */
    const employees = await User.find({
      companyId,
      managerId: { $ne: null }
    }).select("_id name managerId");

    const employeeIds = employees.map(e => e._id);

    /* 3️⃣ Attendance */
    const attendance = await Attendance.find({
      companyId,
      date,
      userId: { $in: employeeIds }
    });

    /* 4️⃣ Leaves */
    const leaves = await Leave.find({
      companyId,
      userId: { $in: employeeIds },
      status: "approved",
      fromDate: { $lte: date },
      toDate: { $gte: date }
    });

    const attendanceMap = {};
    attendance.forEach(a => {
      attendanceMap[a.userId.toString()] = a;
    });

    const leaveSet = new Set(
      leaves.map(l => l.userId.toString())
    );

    /* 5️⃣ Group employees under managers */
    const result = managers.map(m => {
      const team = employees
        .filter(e => e.managerId?.toString() === m._id.toString())
        .map(e => {
          const uid = e._id.toString();

          if (leaveSet.has(uid)) {
            return {
              userId: e._id,
              name: e.name,
              status: "on_leave"
            };
          }

          const a = attendanceMap[uid];
          if (!a) {
            return {
              userId: e._id,
              name: e.name,
              status: "absent"
            };
          }

          return {
            userId: e._id,
            name: e.name,
            status: a.status,
            checkInTime: a.checkInTime,
            checkOutTime: a.checkOutTime
          };
        });

      return {
        managerId: m._id,
        managerName: m.name,
        team
      };
    });

    res.json(result);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
