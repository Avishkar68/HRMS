import express from "express";
import {
  getDocuments,
  createDocument,
  updateDocument,
  deleteDocument,
} from "../controllers/document.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { allowRoles } from "../middleware/role.middleware.js";

const router = express.Router();

router.get("/", protect, allowRoles("admin"), getDocuments);
router.post("/", protect, allowRoles("admin"), createDocument);
router.patch("/:id", protect, allowRoles("admin"), updateDocument);
router.delete("/:id", protect, allowRoles("admin"), deleteDocument);

export default router;
