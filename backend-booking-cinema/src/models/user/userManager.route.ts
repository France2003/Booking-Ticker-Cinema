import express from "express";
import { requireAuth, isAdmin } from "../../middlewares/auth.middleware";
import {
  getAllUsers,
  getUserById,
  toggleUserStatus,
  deleteUser,
} from "../../models/user/userManager.controller";

const router = express.Router();

router.get("/", requireAuth, isAdmin, getAllUsers);
router.get("/:id", requireAuth, isAdmin, getUserById);
router.patch("/:id/status", requireAuth, isAdmin, toggleUserStatus);
router.delete("/:id", requireAuth, isAdmin, deleteUser);
export default router;
