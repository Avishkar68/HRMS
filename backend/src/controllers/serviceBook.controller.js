import ServiceBook from "../models/ServiceBook.model.js";
import User from "../models/User.model.js";

// Create Service Book Entry (Admin/Manager only)
export const createServiceBookEntry = async (req, res) => {
  try {
    const {
      userId,
      eventType,
      eventDate,
      designation,
      department,
      salaryDetails,
      officeOrderNumber,
      remarks
    } = req.body;
    
    const companyId = req.user.companyId;
    const recordedBy = req.user.id;
    const role = req.user.role;

    if (!userId || !eventType || !eventDate || !designation || !department || !officeOrderNumber) {
      return res.status(400).json({ message: "Employee, event type, date, designation, department, and office order number are required" });
    }

    // Verify employee exists and is in the same company
    const employee = await User.findOne({ _id: userId, companyId });
    if (!employee) {
      return res.status(404).json({ message: "Employee not found in your company" });
    }

    // If manager, verify the employee reports to them
    if (role === "manager") {
      if (!employee.managerId || employee.managerId.toString() !== recordedBy) {
        return res.status(403).json({ message: "Managers can only log service records for reporting employees" });
      }
    }

    const entry = await ServiceBook.create({
      companyId,
      userId,
      eventType,
      eventDate,
      designation,
      department,
      salaryDetails,
      officeOrderNumber,
      remarks,
      recordedBy
    });

    const populated = await ServiceBook.findById(entry._id)
      .populate("userId", "name email role")
      .populate("recordedBy", "name email role")
      .lean();

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Retrieve Service Book Entries (Admin, Manager, Employee)
export const getServiceBookEntries = async (req, res) => {
  try {
    const companyId = req.user.companyId;
    const userId = req.user.id;
    const role = req.user.role;
    const { employeeId } = req.query;

    let query = { companyId };

    if (employeeId) {
      // Fetching records for a specific employee
      if (role === "employee" && employeeId !== userId) {
        return res.status(403).json({ message: "Access denied. Employees can only view their own service book" });
      }

      if (role === "manager") {
        if (employeeId !== userId) {
          const targetEmp = await User.findOne({ _id: employeeId, companyId });
          if (!targetEmp || !targetEmp.managerId || targetEmp.managerId.toString() !== userId) {
            return res.status(403).json({ message: "Access denied. Managers can only view records of direct reportees" });
          }
        }
      }

      query.userId = employeeId;
    } else {
      // No employeeId query param provided
      if (role === "employee") {
        query.userId = userId;
      } else if (role === "manager") {
        // Return entries for self or reporting team members
        const team = await User.find({ companyId, managerId: userId }).select("_id");
        const teamIds = team.map(u => u._id);
        query.userId = { $in: [userId, ...teamIds] };
      }
      // Admins fetch all entries in company if no filter is set
    }

    const entries = await ServiceBook.find(query)
      .populate("userId", "name email role")
      .populate("recordedBy", "name email role")
      .sort({ eventDate: -1, createdAt: -1 })
      .lean();

    res.json(entries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Service Book Entry (Admin or Recorder Manager only)
export const updateServiceBookEntry = async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = req.user.companyId;
    const userId = req.user.id;
    const role = req.user.role;

    const entry = await ServiceBook.findOne({ _id: id, companyId });
    if (!entry) {
      return res.status(404).json({ message: "Service book record not found" });
    }

    // Permission checks: Admin, or the original Manager who created it
    if (role !== "admin" && entry.recordedBy.toString() !== userId) {
      return res.status(403).json({ message: "Access denied. Only administrators or the record creator can update this entry" });
    }

    const {
      eventType,
      eventDate,
      designation,
      department,
      salaryDetails,
      officeOrderNumber,
      remarks
    } = req.body;

    if (eventType) entry.eventType = eventType;
    if (eventDate) entry.eventDate = eventDate;
    if (designation) entry.designation = designation;
    if (department) entry.department = department;
    if (salaryDetails !== undefined) entry.salaryDetails = salaryDetails;
    if (officeOrderNumber) entry.officeOrderNumber = officeOrderNumber;
    if (remarks !== undefined) entry.remarks = remarks;

    await entry.save();

    const populated = await ServiceBook.findById(entry._id)
      .populate("userId", "name email role")
      .populate("recordedBy", "name email role")
      .lean();

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete Service Book Entry (Admin or Recorder Manager only)
export const deleteServiceBookEntry = async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = req.user.companyId;
    const userId = req.user.id;
    const role = req.user.role;

    const entry = await ServiceBook.findOne({ _id: id, companyId });
    if (!entry) {
      return res.status(404).json({ message: "Service book record not found" });
    }

    // Permission checks: Admin, or the original Manager who created it
    if (role !== "admin" && entry.recordedBy.toString() !== userId) {
      return res.status(403).json({ message: "Access denied. Only administrators or the record creator can delete this entry" });
    }

    await ServiceBook.deleteOne({ _id: id });

    res.json({ message: "Service book entry deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
