import express from "express";
import { createAppraisal, getAppraisals, submitSelfEvaluation, deleteAppraisal } from "../controllers/appraisal.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { allowRoles } from "../middleware/role.middleware.js";

const router = express.Router();

router.post("/", protect, allowRoles("manager"), createAppraisal);
router.get("/", protect, allowRoles("admin", "manager", "employee"), getAppraisals);
router.put("/:id/self-eval", protect, allowRoles("employee"), submitSelfEvaluation);
router.delete("/:id", protect, allowRoles("admin", "manager"), deleteAppraisal);

export default router;
