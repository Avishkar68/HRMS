import Attendance from "../models/Attendance.model.js";
import Leave from "../models/Leave.model.js";
import User from "../models/User.model.js";

export const getReportsSummary = async (req, res) => {
  try {
    const companyId = req.user.companyId;
    const year = parseInt(req.query.year, 10) || new Date().getFullYear();

    const yearStr = String(year);
    const startDate = `${yearStr}-01-01`;
    const endDate = `${yearStr}-12-31`;

    const [userCount, leaveStatusCounts, attendanceByMonth, leavesByMonth] = await Promise.all([
      User.countDocuments({ companyId }),
      Leave.aggregate([
        { $match: { companyId } },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
      Attendance.aggregate([
        { $match: { companyId, date: { $gte: startDate, $lte: endDate } } },
        { $group: { _id: { $substr: ["$date", 0, 7] }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      Leave.aggregate([
        {
          $match: {
            companyId,
            fromDate: { $lte: endDate },
            toDate: { $gte: startDate },
          },
        },
        { $group: { _id: { $substr: ["$fromDate", 0, 7] }, count: { $sum: 1 }, totalDays: { $sum: "$totalDays" } } },
        { $sort: { _id: 1 } },
      ]),
    ]);

    const leaveByStatus = {};
    leaveStatusCounts.forEach((s) => {
      leaveByStatus[s._id] = s.count;
    });

    res.json({
      year,
      userCount,
      leaveStatusCounts: leaveByStatus,
      attendanceByMonth: attendanceByMonth.map((m) => ({ month: m._id, count: m.count })),
      leavesByMonth: leavesByMonth.map((m) => ({ month: m._id, count: m.count, totalDays: m.totalDays })),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
