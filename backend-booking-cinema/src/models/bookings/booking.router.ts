import express from "express";
import {
    createBooking,
    getAllBookingsForAdmin,
    getBookingsByUser,
    getMyBookings,
    updateBookingStatus,
} from "./booking.controller";
import { momoCreatePayment, momoCallback } from "./booking.momo";
import { requireAuth, isAdmin } from "../../middlewares/auth.middleware";
const router = express.Router();
router.post("/create", requireAuth, createBooking);
router.post("/momo-pay", requireAuth, momoCreatePayment);
router.post("/momo-callback", momoCallback);
router.patch("/update-status", requireAuth,isAdmin, updateBookingStatus);
router.get("/my-bookings", requireAuth, getMyBookings);
router.get("/confirm", requireAuth, getMyBookings);
router.get("/user/:id", getBookingsByUser);
// ✅ Route cho admin lấy toàn bộ danh sách vé
router.get("/admin/bookings", requireAuth, isAdmin, getAllBookingsForAdmin);
export default router;
