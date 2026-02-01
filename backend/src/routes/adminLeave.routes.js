import express from "express";
import { getAllLeaves } from "../controllers/adminLeave.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { allowRoles } from "../middleware/role.middleware.js";

const router = express.Router();

router.get(
  "/leaves",
  protect,
  allowRoles("admin"),
  getAllLeaves
);

export default router;
