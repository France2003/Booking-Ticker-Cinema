import express from "express";
import { requireAuth } from "../../middlewares/auth.middleware";
import { createVNPayPayment, getMyBookings, vnpayReturn } from "./booking.controller";

const router = express.Router();

router.post("/create-payment", requireAuth, createVNPayPayment);
router.get("/vnpay-return", vnpayReturn);
router.get("/me", requireAuth, getMyBookings);
export default router;
