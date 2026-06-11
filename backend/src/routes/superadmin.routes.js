import express from "express";
import { createCompany, getCompanies, getUsage, updateCompany } from "../controllers/superadmin.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { allowRoles } from "../middleware/role.middleware.js";

const router = express.Router();

router.get("/companies", protect, allowRoles("superadmin"), getCompanies);
router.get("/usage", protect, allowRoles("superadmin"), getUsage);

router.post(
    "/company",
    protect,
    allowRoles("superadmin"),
    createCompany
);

router.patch(
    "/company/:id",
    protect,
    allowRoles("superadmin"),
    updateCompany
);

export default router;
