import Task from "../models/Task.model.js";
import User from "../models/User.model.js";
import Notification from "../models/Notification.model.js";

// Create / Assign Task
export const createTask = async (req, res) => {
  try {
    const { title, description, assignedTo, priority, dueDate } = req.body;
    const companyId = req.user.companyId;
    const assignedBy = req.user.id;
    const role = req.user.role;

    if (!title || !assignedTo || !dueDate) {
      return res.status(400).json({ message: "Title, assignee and due date are required" });
    }

    // Verify assignee exists, is in same company and active
    const assignee = await User.findOne({ _id: assignedTo, companyId, status: "active" });
    if (!assignee) {
      return res.status(400).json({ message: "Invalid or inactive assignee selected" });
    }

    // Enforce role assignment rules:
    if (role === "manager") {
      // Managers can only assign tasks to employees who report to them
      if (assignee.role !== "employee") {
        return res.status(400).json({ message: "Managers can only assign tasks to employees" });
      }
      if (!assignee.managerId || assignee.managerId.toString() !== assignedBy) {
        return res.status(403).json({ message: "You can only assign tasks to employees reporting to you" });
      }
    } else if (role === "admin") {
      // Admins can only assign tasks to managers
      if (assignee.role !== "manager") {
        return res.status(400).json({ message: "Admins can only assign tasks to managers" });
      }
    } else {
      return res.status(403).json({ message: "Employees cannot assign tasks" });
    }

    const task = await Task.create({
      companyId,
      title,
      description: description || "",
      assignedTo,
      assignedBy,
      priority: priority || "medium",
      dueDate,
      status: "pending"
    });

    const populatedTask = await Task.findById(task._id)
      .populate("assignedTo", "name email role")
      .populate("assignedBy", "name email role")
      .lean();

    res.status(201).json(populatedTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Tasks
export const getTasks = async (req, res) => {
  try {
    const companyId = req.user.companyId;
    const userId = req.user.id;
    const role = req.user.role;

    let query = { companyId };

    if (role === "employee") {
      query.assignedTo = userId;
    } else if (role === "manager") {
      const team = await User.find({ companyId, managerId: userId }).select("_id");
      const teamIds = team.map(u => u._id);
      
      query.$or = [
        { assignedTo: userId },
        { assignedBy: userId },
        { assignedTo: { $in: teamIds } }
      ];
    } // Admin gets all tasks in the company

    const tasks = await Task.find(query)
      .populate("assignedTo", "name email role")
      .populate("assignedBy", "name email role")
      .sort({ createdAt: -1 })
      .lean();

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Task
export const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = req.user.companyId;
    const userId = req.user.id;
    const role = req.user.role;

    const task = await Task.findOne({ _id: id, companyId });
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const isAssignee = task.assignedTo.toString() === userId;
    const isCreator = task.assignedBy.toString() === userId;

    // 1. If the user is the assignee, they can ONLY update the status
    if (isAssignee) {
      const { status } = req.body;
      if (!status) {
        return res.status(400).json({ message: "Only status changes are allowed for assignee" });
      }
      if (!["pending", "in-progress", "completed"].includes(status)) {
        return res.status(400).json({ message: "Invalid status value" });
      }
      task.status = status;
    } 
    // 2. If the user is the creator (parent), they can edit everything EXCEPT status
    else if (isCreator || role === "admin") {
      const { title, description, assignedTo, priority, dueDate, status } = req.body;

      // Restrict status modification by parent
      if (status && status !== task.status) {
        return res.status(400).json({ message: "Task creators cannot modify status; only the assignee can update status." });
      }

      if (title) task.title = title;
      if (description !== undefined) task.description = description;
      if (priority) task.priority = priority;
      if (dueDate) task.dueDate = dueDate;

      if (assignedTo && assignedTo !== task.assignedTo.toString()) {
        const assignee = await User.findOne({ _id: assignedTo, companyId, status: "active" });
        if (!assignee) {
          return res.status(400).json({ message: "Invalid or inactive assignee selected" });
        }

        // Validate assignment based on role of who is updating (admin/manager)
        if (role === "manager" && !isCreator) {
          // If a manager who is not creator tries to update, verify it is their team task
          const team = await User.find({ companyId, managerId: userId }).select("_id");
          const teamIds = team.map(u => u._id.toString());
          if (!teamIds.includes(task.assignedTo.toString())) {
            return res.status(403).json({ message: "Access denied" });
          }
        }

        // Apply same assignment rule validations
        const updaterRole = role; // admin or manager
        if (updaterRole === "manager") {
          if (assignee.role !== "employee") {
            return res.status(400).json({ message: "Managers can only assign tasks to employees" });
          }
          if (!assignee.managerId || assignee.managerId.toString() !== userId) {
            return res.status(403).json({ message: "Assignee must report to you" });
          }
        } else if (updaterRole === "admin") {
          if (assignee.role !== "manager") {
            return res.status(400).json({ message: "Admins can only assign tasks to managers" });
          }
        }

        task.assignedTo = assignedTo;
      }
    } else {
      return res.status(403).json({ message: "Access denied" });
    }

    await task.save();
    
    const updatedTask = await Task.findById(task._id)
      .populate("assignedTo", "name email role")
      .populate("assignedBy", "name email role")
      .lean();

    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete Task
export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = req.user.companyId;
    const userId = req.user.id;
    const role = req.user.role;

    const task = await Task.findOne({ _id: id, companyId });
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (role === "admin" || (role === "manager" && task.assignedBy.toString() === userId)) {
      await Task.deleteOne({ _id: id });
      return res.json({ message: "Task deleted successfully" });
    }

    res.status(403).json({ message: "Access denied" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get potential assignees
export const getAssignees = async (req, res) => {
  try {
    const companyId = req.user.companyId;
    const userId = req.user.id;
    const role = req.user.role;

    let usersQuery = { companyId, status: "active" };

    if (role === "manager") {
      // Managers can only assign to employees reporting to them
      usersQuery.role = "employee";
      usersQuery.managerId = userId;
    } else if (role === "admin") {
      // Admins can only assign to managers
      usersQuery.role = "manager";
    } else {
      return res.status(403).json({ message: "Access denied" });
    }

    const users = await User.find(usersQuery)
      .select("name email role")
      .sort({ name: 1 })
      .lean();

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Send task reminder alert
export const sendAlert = async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = req.user.companyId;
    const userId = req.user.id;

    const task = await Task.findOne({ _id: id, companyId });
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Only the creator (parent) can alert the assignee
    if (task.assignedBy.toString() !== userId) {
      return res.status(403).json({ message: "Only the task assigner can send alerts" });
    }

    // Create Notification alert
    await Notification.create({
      companyId,
      userId: task.assignedTo,
      message: `Reminder: Alert on task "${task.title}" from ${req.user.name || "Manager"}. Please update progress.`
    });

    res.json({ message: "Alert sent successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get notifications for active user
export const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const notifications = await Notification.find({ userId, read: false })
      .sort({ createdAt: -1 })
      .lean();
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mark notification as read
export const markNotificationRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    await Notification.updateOne({ _id: id, userId }, { read: true });
    res.json({ message: "Marked as read" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
