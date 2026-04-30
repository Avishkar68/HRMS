import express from "express";
import { getReportsSummary } from "../controllers/adminReports.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { allowRoles } from "../middleware/role.middleware.js";

const router = express.Router();

router.get("/summary", protect, allowRoles("admin"), getReportsSummary);

export default router;
