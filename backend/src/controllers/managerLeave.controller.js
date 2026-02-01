import Leave from "../models/Leave.model.js";
import User from "../models/User.model.js";
import LeaveBalance from "../models/LeaveBalance.model.js";

export const getTeamLeaves = async (req, res) => {
    try {
        const leaves = await Leave.find({
            companyId: req.user.companyId,
            managerId: req.user.id
        })
            .sort({ createdAt: -1 })
            .lean();

        // attach employee info
        const userIds = leaves.map(l => l.userId);
        const users = await User.find(
            { _id: { $in: userIds } },
            { name: 1, email: 1 }
        ).lean();

        const userMap = {};
        users.forEach(u => {
            userMap[u._id.toString()] = u;
        });

        const result = leaves.map(l => ({
            ...l,
            employee: userMap[l.userId.toString()]
        }));

        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
export const updateLeaveStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const { id } = req.params;

        if (!["approved", "rejected"].includes(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }

        const leave = await Leave.findOne({
            _id: id,
            managerId: req.user.id,
            companyId: req.user.companyId,
            status: "pending"
        });

        if (!leave) {
            return res.status(404).json({ message: "Leave not found" });
        }

        leave.status = status;
        await leave.save();
        if (status === "approved") {
            const year = new Date().getFullYear();

            const balance = await LeaveBalance.findOne({
                companyId: leave.companyId,
                userId: leave.userId,
                leaveTypeId: leave.leaveTypeId,
                year
            });

            balance.used += leave.totalDays;
            balance.remaining -= leave.totalDays;

            await balance.save();
        }
        res.json({
            message: `Leave ${status}`,
            leave
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
