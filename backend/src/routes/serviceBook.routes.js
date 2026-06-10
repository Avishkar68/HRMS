import express from "express";
import {
  createServiceBookEntry,
  getServiceBookEntries,
  updateServiceBookEntry,
  deleteServiceBookEntry
} from "../controllers/serviceBook.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { allowRoles } from "../middleware/role.middleware.js";

const router = express.Router();

router.post("/", protect, allowRoles("admin", "manager"), createServiceBookEntry);
router.get("/", protect, allowRoles("admin", "manager", "employee"), getServiceBookEntries);
router.put("/:id", protect, allowRoles("admin", "manager"), updateServiceBookEntry);
router.delete("/:id", protect, allowRoles("admin", "manager"), deleteServiceBookEntry);

export default router;
