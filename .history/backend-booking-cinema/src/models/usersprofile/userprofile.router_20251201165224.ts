import { Router,Request, Response } from "express";
import { getMyBookings, getProfile, updateProfile } from "./userprofile.controller";
import { isAdmin, requireAuth } from "../../middlewares/auth.middleware";
const router = Router();
router.get("/profile", requireAuth, getProfile);
router.put("/profile", requireAuth, updateProfile);
router.get("/me/bookings", requireAuth, updateProfile,getMyBookings);

export default router;
