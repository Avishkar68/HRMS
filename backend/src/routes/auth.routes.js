import express from "express";
import { login, superAdminLogin } from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/login", login);
router.post("/superadmin/login", superAdminLogin);

export default router;
