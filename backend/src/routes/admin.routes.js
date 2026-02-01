import express from "express";
import { createUser } from "../controllers/admin.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { allowRoles } from "../middleware/role.middleware.js";

const router = express.Router();

router.post(
  "/users",
  protect,
  allowRoles("admin"),
  createUser
);


export default router;
