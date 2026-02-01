import express from "express";
import {
  createLeaveType,
  getLeaveTypes
} from "../controllers/leaveType.controller.js";

import { protect } from "../middleware/auth.middleware.js";
import { allowRoles } from "../middleware/role.middleware.js";

const router = express.Router();

router.post(
  "/leave-types",
  protect,
  allowRoles("admin"),
  createLeaveType
);

router.get(
  "/leave-types",
  protect,
  allowRoles("admin"),
  getLeaveTypes
);

export default router;
