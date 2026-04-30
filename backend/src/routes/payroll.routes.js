import express from "express";
import {
  getPayrollList,
  createPayroll,
  updatePayrollStatus,
  calculatePayroll,
} from "../controllers/payroll.controller.js";
import { getMyPayslips } from "../controllers/payroll.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { allowRoles } from "../middleware/role.middleware.js";

const router = express.Router();

router.get("/my", protect, allowRoles("employee"), getMyPayslips);
router.get("/calculate", protect, allowRoles("admin"), calculatePayroll);
router.get("/", protect, allowRoles("admin"), getPayrollList);
router.post("/", protect, allowRoles("admin"), createPayroll);
router.patch("/:id", protect, allowRoles("admin"), updatePayrollStatus);

export default router;
