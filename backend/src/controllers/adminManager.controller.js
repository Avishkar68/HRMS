import User from "../models/User.model.js";

export const getManagers = async (req, res) => {
  try {
    const managers = await User.find({
      companyId: req.user.companyId,
      role: "manager"
    }).select("_id name email");

    res.json(managers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
