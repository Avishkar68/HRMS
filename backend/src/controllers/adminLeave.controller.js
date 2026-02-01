import Leave from "../models/Leave.model.js";
import User from "../models/User.model.js";

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
    const userIds = leaves.map(l => l.userId);
    const managerIds = leaves.map(l => l.managerId);

    const users = await User.find(
      { _id: { $in: [...userIds, ...managerIds] } },
      { name: 1, email: 1 }
    ).lean();

    const userMap = {};
    users.forEach(u => {
      userMap[u._id.toString()] = u;
    });

    const result = leaves.map(l => ({
      ...l,
      employee: userMap[l.userId.toString()],
      manager: userMap[l.managerId.toString()]
    }));

    res.json(result);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
