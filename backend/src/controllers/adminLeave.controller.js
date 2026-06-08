import Leave from "../models/Leave.model.js";
import User from "../models/User.model.js";
import LeaveType from "../models/LeaveType.model.js";

export const getAllLeaves = async (req, res) => {
  try {
    const { status, userId } = req.query;

    const filter = {
      companyId: req.user.companyId
    };

    if (status) filter.status = status;
    if (userId) filter.userId = userId;

    const leaves = await Leave.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    // collect user ids
    const userIds = leaves.map(l => l.userId).filter(Boolean);
    const managerIds = leaves.map(l => l.managerId).filter(Boolean);

    const users = await User.find(
      { _id: { $in: [...userIds, ...managerIds] } },
      { name: 1, email: 1 }
    ).lean();

    const userMap = {};
    users.forEach(u => {
      userMap[u._id.toString()] = u;
    });

    // collect leave type ids
    const leaveTypeIds = leaves.map(l => l.leaveTypeId).filter(Boolean);
    const leaveTypes = await LeaveType.find({ _id: { $in: leaveTypeIds } }).lean();
    const leaveTypeMap = {};
    leaveTypes.forEach(lt => {
      leaveTypeMap[lt._id.toString()] = lt;
    });

    const result = leaves.map(l => ({
      ...l,
      employee: userMap[l.userId.toString()],
      manager: l.managerId ? userMap[l.managerId.toString()] : null,
      leaveType: l.leaveTypeId ? leaveTypeMap[l.leaveTypeId.toString()] : null
    }));

    res.json(result);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
