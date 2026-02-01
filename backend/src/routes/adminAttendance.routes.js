import express from "express";
import { getAdminAttendanceGrouped, getAttendanceList } from "../controllers/adminAttendance.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { allowRoles } from "../middleware/role.middleware.js";

const router = express.Router();

router.get(
  "/attendance",
  protect,
  allowRoles("admin"),
  getAttendanceList
);
router.get(
  "/attendance/grouped",
   protect,
  allowRoles("admin"),
  getAdminAttendanceGrouped
);


export default router;
