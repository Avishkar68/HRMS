import express from "express";
import { createCompany } from "../controllers/superadmin.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { allowRoles } from "../middleware/role.middleware.js";

const router = express.Router();

router.post(
    "/company",
    protect,
    allowRoles("superadmin"),
    createCompany
);

export default router;
