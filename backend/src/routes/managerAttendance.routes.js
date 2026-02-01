import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { allowRoles } from "../middleware/role.middleware.js";
import {
  getTodayTeamAttendance,
  getEmployeeMonthAttendance
} from "../controllers/managerAttendance.controller.js";

const router = express.Router();

router.get(
  "/team-attendance/today",
  protect,
  allowRoles("manager"),
  getTodayTeamAttendance
);

router.get(
  "/employee-attendance/:userId",
  protect,
  allowRoles("manager"),
  getEmployeeMonthAttendance
);

export default router;
