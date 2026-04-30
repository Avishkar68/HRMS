import express from "express";
import { createUser, getUsers, getDashboardStats } from "../controllers/admin.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { allowRoles } from "../middleware/role.middleware.js";

const router = express.Router();

router.get("/dashboard/stats", protect, allowRoles("admin"), getDashboardStats);
router.get("/users", protect, allowRoles("admin"), getUsers);

router.post(
  "/users",
  protect,
  allowRoles("admin"),
  createUser
);


export default router;
