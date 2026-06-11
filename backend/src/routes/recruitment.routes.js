import express from "express";
import {
  getJobs,
  createJob,
  updateJob,
  deleteJob,
  getApplications,
  applyJob,
  updateApplicationStatus,
  deleteApplication
} from "../controllers/recruitment.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { allowRoles } from "../middleware/role.middleware.js";

const router = express.Router();

// ================= PUBLIC ROUTING =================
router.post("/public/apply", applyJob);
router.get("/public/jobs/:companyId", getJobs);

// ================= PROTECTED STAFF ROUTING =================
router.get("/jobs", protect, allowRoles("admin", "manager"), getJobs);
router.post("/jobs", protect, allowRoles("admin"), createJob);
router.patch("/jobs/:id", protect, allowRoles("admin"), updateJob);
router.delete("/jobs/:id", protect, allowRoles("admin"), deleteJob);

router.get("/applications", protect, allowRoles("admin", "manager"), getApplications);
router.post("/applications", protect, allowRoles("admin"), applyJob); // Manual HR resume entry
router.patch("/applications/:id", protect, allowRoles("admin", "manager"), updateApplicationStatus);
router.delete("/applications/:id", protect, allowRoles("admin"), deleteApplication);

export default router;
