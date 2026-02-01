import express from "express";
import {
  getTeamLeaves,
  updateLeaveStatus
} from "../controllers/managerLeave.controller.js";

import { protect } from "../middleware/auth.middleware.js";
import { allowRoles } from "../middleware/role.middleware.js";

const router = express.Router();

router.get(
  "/leaves",
  protect,
  allowRoles("manager"),
  getTeamLeaves
);

router.patch(
  "/leaves/:id",
  protect,
  allowRoles("manager"),
  updateLeaveStatus
);

export default router;
