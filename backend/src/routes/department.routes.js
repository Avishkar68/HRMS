import express from "express";
import {
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from "../controllers/department.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { allowRoles } from "../middleware/role.middleware.js";

const router = express.Router();

router.get("/", protect, allowRoles("admin"), getDepartments);
router.post("/", protect, allowRoles("admin"), createDepartment);
router.patch("/:id", protect, allowRoles("admin"), updateDepartment);
router.delete("/:id", protect, allowRoles("admin"), deleteDepartment);

export default router;
