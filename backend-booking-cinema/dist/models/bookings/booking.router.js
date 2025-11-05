"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const booking_controller_1 = require("./booking.controller");
const router = express_1.default.Router();
router.post("/create-payment", auth_middleware_1.requireAuth, booking_controller_1.createVNPayPayment);
router.get("/vnpay-return", booking_controller_1.vnpayReturn);
router.get("/me", auth_middleware_1.requireAuth, booking_controller_1.getMyBookings);
exports.default = router;
