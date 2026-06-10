import express from "express";
import { getTeamMembers } from "../controllers/managerTeam.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { allowRoles } from "../middleware/role.middleware.js";

const router = express.Router();

router.get("/", protect, allowRoles("manager"), getTeamMembers);

export default router;
