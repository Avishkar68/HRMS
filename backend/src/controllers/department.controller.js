import Department from "../models/Department.model.js";
import User from "../models/User.model.js";

export const getDepartments = async (req, res) => {
  try {
    const departments = await Department.find({ companyId: req.user.companyId })
      .populate("headId", "name email")
      .sort({ name: 1 })
      .lean();
    res.json(departments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createDepartment = async (req, res) => {
  try {
    const { name, code, headId } = req.body;
    if (!name) return res.status(400).json({ message: "Name is required" });

    const exists = await Department.findOne({
      companyId: req.user.companyId,
      name: name.trim(),
    });
    if (exists) return res.status(400).json({ message: "Department already exists" });

    const department = await Department.create({
      companyId: req.user.companyId,
      name: name.trim(),
      code: code || "",
      headId: headId || null,
    });
    res.status(201).json(department);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code, headId } = req.body;

    const department = await Department.findOne({
      _id: id,
      companyId: req.user.companyId,
    });
    if (!department) return res.status(404).json({ message: "Department not found" });

    if (name) department.name = name.trim();
    if (code !== undefined) department.code = code;
    if (headId !== undefined) department.headId = headId || null;
    await department.save();
    res.json(department);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const department = await Department.findOneAndDelete({
      _id: id,
      companyId: req.user.companyId,
    });
    if (!department) return res.status(404).json({ message: "Department not found" });
    res.json({ message: "Department deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
