import express from "express";
import { getMyLeaveBalance } from "../controllers/leaveBalance.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { allowRoles } from "../middleware/role.middleware.js";

const router = express.Router();

router.get(
  "/balance",
  protect,
  allowRoles("employee"),
  getMyLeaveBalance
);

export default router;
