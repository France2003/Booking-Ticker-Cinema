import { Router,Request, Response } from "express";
import { getProfile, updateProfile } from "./userprofile.controller";
import { requireAuth } from "../../middlewares/auth.middleware";
const router = Router();
router.get("/profile", requireAuth, getProfile);
router.put("/profile", requireAuth, updateProfile);
export default router;
