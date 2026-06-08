import LeaveBalance from "../models/LeaveBalance.model.js";
import LeaveType from "../models/LeaveType.model.js";

export const getMyLeaveBalance = async (req, res) => {
  try {
    const year = new Date().getFullYear();

    let balances = await LeaveBalance.find({
      companyId: req.user.companyId,
      userId: req.user.id,
      year
    }).lean();

    if (balances.length === 0) {
      const leaveTypes = await LeaveType.find({
        companyId: req.user.companyId
      }).lean();

      if (leaveTypes.length > 0) {
        const newBalances = leaveTypes.map(type => ({
          companyId: req.user.companyId,
          userId: req.user.id,
          leaveTypeId: type._id,
          year,
          total: type.yearlyQuota,
          used: 0,
          remaining: type.yearlyQuota
        }));
        await LeaveBalance.insertMany(newBalances);
        balances = await LeaveBalance.find({
          companyId: req.user.companyId,
          userId: req.user.id,
          year
        }).lean();
      }
    }

    const leaveTypeIds = balances.map(b => b.leaveTypeId);

    const types = await LeaveType.find({
      _id: { $in: leaveTypeIds }
    }).lean();

    const typeMap = {};
    types.forEach(t => {
      typeMap[t._id.toString()] = t;
    });

    const result = balances.map(b => ({
      leaveTypeId: b.leaveTypeId,           // ✅ IMPORTANT
      leaveType: typeMap[b.leaveTypeId]?.name,
      total: b.total,
      used: b.used,
      remaining: b.remaining
    }));

    res.json(result);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
