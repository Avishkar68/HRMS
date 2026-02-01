import express from "express";
import { applyLeave,getMyLeaves } from "../controllers/leave.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { allowRoles } from "../middleware/role.middleware.js";

const router = express.Router();

router.post(
  "/apply",
  protect,
  allowRoles("employee"),
  applyLeave
);

router.get(
  "/my",
  protect,
  allowRoles("employee"),
  getMyLeaves
);

export default router;
