import express from "express";
import { 
  createTask, 
  getTasks, 
  updateTask, 
  deleteTask, 
  getAssignees,
  sendAlert,
  getNotifications,
  markNotificationRead
} from "../controllers/task.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { allowRoles } from "../middleware/role.middleware.js";

const router = express.Router();

router.post("/", protect, allowRoles("admin", "manager"), createTask);
router.get("/", protect, allowRoles("admin", "manager", "employee"), getTasks);
router.get("/assignees", protect, allowRoles("admin", "manager"), getAssignees);
router.put("/:id", protect, allowRoles("admin", "manager", "employee"), updateTask);
router.delete("/:id", protect, allowRoles("admin", "manager"), deleteTask);

// Notifications & Reminder Alerts
router.post("/:id/alert", protect, allowRoles("admin", "manager"), sendAlert);
router.get("/notifications", protect, allowRoles("admin", "manager", "employee"), getNotifications);
router.put("/notifications/:id/read", protect, allowRoles("admin", "manager", "employee"), markNotificationRead);

export default router;
