import express from "express";
import {
  checkIn,
  checkOut,
  todayStatus
} from "../controllers/attendance.controller.js";

import { protect } from "../middleware/auth.middleware.js";
import { allowRoles } from "../middleware/role.middleware.js";
import { getAttendanceHistory } from "../controllers/attendance.controller.js";

const router = express.Router();

router.post("/check-in", protect, allowRoles("employee"), checkIn);
router.post("/check-out", protect, allowRoles("employee"), checkOut);
router.get("/today", protect, allowRoles("employee"), todayStatus);

router.get(
  "/history",
  protect,
  allowRoles("employee"),
  getAttendanceHistory
);
export default router;
