import User from "../models/User.model.js";

export const getTeamMembers = async (req, res) => {
  try {
    const companyId = req.user.companyId;
    const managerId = req.user.id;

    const team = await User.find({ companyId, managerId, status: "active" })
      .select("-passwordHash")
      .populate("departmentId", "name code")
      .sort({ name: 1 })
      .lean();

    res.json(team);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
