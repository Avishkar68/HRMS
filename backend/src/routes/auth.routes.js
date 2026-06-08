import express from "express";
import { login, superAdminLogin, getMe, changePassword } from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { allowRoles } from "../middleware/role.middleware.js";

const router = express.Router();

router.get("/me", protect, allowRoles("employee", "manager", "admin"), getMe);
router.post("/login", login);
router.post("/superadmin/login", superAdminLogin);
router.put("/change-password", protect, allowRoles("employee", "manager", "admin"), changePassword);

export default router;
