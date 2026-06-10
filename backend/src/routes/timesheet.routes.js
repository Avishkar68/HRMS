import express from "express";
import { createTimesheet, getTimesheets, updateTimesheet, deleteTimesheet } from "../controllers/timesheet.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { allowRoles } from "../middleware/role.middleware.js";

const router = express.Router();

router.post("/", protect, allowRoles("employee"), createTimesheet);
router.get("/", protect, allowRoles("admin", "manager", "employee"), getTimesheets);
router.put("/:id", protect, allowRoles("admin", "manager", "employee"), updateTimesheet);
router.delete("/:id", protect, allowRoles("admin", "manager", "employee"), deleteTimesheet);

export default router;
