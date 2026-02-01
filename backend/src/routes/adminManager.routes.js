// src/routes/adminManager.routes.js
import express from "express";
import { getManagers } from "../controllers/adminManager.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { allowRoles } from "../middleware/role.middleware.js";

const router = express.Router();

router.get(
  "/managers",
  protect,
  allowRoles("admin"),
  getManagers
);

export default router;
