"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMyBookings = exports.vnpayReturn = exports.createVNPayPayment = void 0;
const booking_model_1 = require("./booking.model");
const showtime_model_1 = require("../showtimes/showtime.model");
const room_model_1 = require("../room/room.model");
const sendEmailTicker_1 = require("../../utils/sendEmailTicker");
const vnpay_1 = require("../../utils/vnpay");
const nanoid_1 = require("nanoid");
/**
 * 🧾 Tạo yêu cầu thanh toán VNPay
 */
const createVNPayPayment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const { showtimeId, selectedSeats } = req.body;
        const showtime = yield showtime_model_1.Showtime.findById(showtimeId)
            .populate("roomId")
            .populate("movieId");
        if (!showtime) {
            res.status(404).json({ message: "Không tìm thấy suất chiếu" });
            return;
        }
        const room = yield room_model_1.Room.findById(showtime.roomId);
        if (!room) {
            res.status(404).json({ message: "Không tìm thấy phòng" });
            return;
        }
        // Kiểm tra ghế đã đặt chưa
        const invalidSeats = room.seats.filter((s) => selectedSeats.includes(s.seatNumber) && s.isBooked);
        if (invalidSeats.length > 0) {
            res.status(400).json({
                message: "Một số ghế đã được đặt trước!",
                seats: invalidSeats.map((s) => s.seatNumber),
            });
            return;
        }
        // Tính tổng tiền
        const seatsInfo = room.seats.filter((s) => selectedSeats.includes(s.seatNumber));
        const totalPrice = seatsInfo.reduce((sum, s) => sum + s.price, 0);
        // Tạo booking tạm
        const bookingCode = "BK-" + (0, nanoid_1.nanoid)(6).toUpperCase();
        const booking = yield booking_model_1.Booking.create({
            userId,
            showtimeId,
            roomId: room._id,
            movieId: showtime.movieId,
            seats: selectedSeats,
            totalPrice,
            bookingCode,
            paymentStatus: "pending",
        });
        // Tạo URL thanh toán
        const ipAddr = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "";
        const paymentUrl = (0, vnpay_1.buildVNPayUrl)(booking.bookingCode, booking.totalPrice, ipAddr);
        res.status(200).json({ paymentUrl, booking });
    }
    catch (error) {
        console.error("❌ Lỗi VNPay:", error);
        res.status(500).json({ message: "Lỗi VNPay", error });
    }
});
exports.createVNPayPayment = createVNPayPayment;
//🔁 Callback từ VNPay sau khi thanh toán
const vnpayReturn = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const isValid = (0, vnpay_1.verifyVNPay)(req.query);
        const bookingCode = req.query["vnp_TxnRef"];
        const booking = yield booking_model_1.Booking.findOne({ bookingCode })
            .populate("movieId")
            .populate("roomId")
            .populate("userId", "email fullname");
        if (!booking) {
            res.status(404).json({ message: "Không tìm thấy vé" });
            return;
        }
        if (!isValid) {
            res.status(400).json({ message: "Sai chữ ký VNPay" });
            return;
        }
        if (req.query["vnp_ResponseCode"] === "00") {
            booking.paymentStatus = "paid";
            booking.transactionId = req.query["vnp_TransactionNo"];
            booking.paymentMethod = "VNPay";
            yield booking.save();
            const room = yield room_model_1.Room.findById(booking.roomId);
            if (room && Array.isArray(room.seats)) {
                room.seats = room.seats.map((s) => {
                    if (booking.seats.includes(s.seatNumber))
                        s.isBooked = true;
                    return s;
                });
                yield room.save();
            }
            const email = ((_a = booking.userId) === null || _a === void 0 ? void 0 : _a.email) || "guest@example.com";
            yield (0, sendEmailTicker_1.sendETicket)(email, booking);
            return res.redirect(`${process.env.FRONTEND_URL}/payment-result?status=success&code=${booking.bookingCode}`);
        }
        else {
            booking.paymentStatus = "cancelled";
            yield booking.save();
            return res.redirect(`${process.env.FRONTEND_URL}/payment-result?status=failed`);
        }
    }
    catch (err) {
        console.error("❌ Lỗi callback VNPay:", err);
        res.status(500).json({ message: "Lỗi callback VNPay", err });
    }
});
exports.vnpayReturn = vnpayReturn;
/**
 * 📜 Lấy danh sách vé của người dùng
 */
const getMyBookings = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            res.status(401).json({ message: "Chưa đăng nhập" });
            return;
        }
        const bookings = yield booking_model_1.Booking.find({ userId })
            .populate("movieId", "tieuDe anhPoster")
            .populate("roomId", "name type")
            .populate("showtimeId", "date startTime endTime")
            .sort({ createdAt: -1 });
        res.status(200).json({ bookings });
    }
    catch (error) {
        console.error("❌ Lỗi khi lấy danh sách vé:", error);
        res.status(500).json({ message: "Lỗi khi lấy vé của người dùng", error });
    }
});
exports.getMyBookings = getMyBookings;
