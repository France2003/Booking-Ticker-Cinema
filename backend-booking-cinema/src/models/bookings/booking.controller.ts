import { Response } from "express";
import { AuthRequest } from "../../middlewares/auth.middleware";
import { Booking } from "./booking.model";
import { Showtime } from "../showtimes/showtime.model";
import { Room } from "../room/room.model";
import { sendETicket } from "../../utils/sendEmailTicker";
import { buildVNPayUrl, verifyVNPay } from "../../utils/vnpay";
import { nanoid } from "nanoid";

/** 🧾 Tạo yêu cầu thanh toán VNPay */
export const createVNPayPayment = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        const { showtimeId, selectedSeats } = req.body;

        const showtime = await Showtime.findById(showtimeId).populate("roomId").populate("movieId");
        if (!showtime) {
            res.status(404).json({ message: "Không tìm thấy suất chiếu" });
            return
        }

        const room = await Room.findById(showtime.roomId);
        if (!room) {
            res.status(404).json({ message: "Không tìm thấy phòng" });
            return
        }

        const invalidSeats = room.seats.filter(
            (s) => selectedSeats.includes(s.seatNumber) && s.isBooked
        );
        if (invalidSeats.length > 0) {
            res.status(400).json({
                message: "Một số ghế đã được đặt trước!",
                seats: invalidSeats.map((s) => s.seatNumber),
            });
            return;
        }

        const seatsInfo = room.seats.filter((s) => selectedSeats.includes(s.seatNumber));
        const totalPrice = seatsInfo.reduce((sum, s) => sum + s.price, 0);

        const bookingCode = "BK-" + nanoid(6).toUpperCase();
        const booking = await Booking.create({
            userId,
            showtimeId,
            roomId: room._id,
            movieId: showtime.movieId,
            seats: selectedSeats,
            totalPrice,
            bookingCode,
            paymentStatus: "pending",
        });

        const ipAddr = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "";
        const paymentUrl = buildVNPayUrl(booking.bookingCode, booking.totalPrice, ipAddr);
        res.status(200).json({ paymentUrl, booking });
    } catch (error) {
        console.error("❌ Lỗi VNPay:", error);
        res.status(500).json({ message: "Lỗi VNPay", error });
    }
};

/** 🔁 Callback từ VNPay */
export const vnpayReturn = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const isValid = verifyVNPay(req.query as Record<string, string>);
        const bookingCode = req.query["vnp_TxnRef"] as string;

        const booking = await Booking.findOne({ bookingCode })
            .populate("movieId")
            .populate("roomId")
            .populate("userId", "email fullname");

        if (!booking) {
            res.status(404).json({ message: "Không tìm thấy vé" });
            return
        }
        if (!isValid) {
            res.status(400).json({ message: "Sai chữ ký VNPay" });
            return
        }

        if (req.query["vnp_ResponseCode"] === "00") {
            booking.paymentStatus = "paid";
            booking.transactionId = req.query["vnp_TransactionNo"] as string;
            booking.paymentMethod = "VNPay";
            await booking.save();

            const room = await Room.findById(booking.roomId);
            if (room && Array.isArray(room.seats)) {
                room.seats = room.seats.map((s) => {
                    if (booking.seats.includes(s.seatNumber)) s.isBooked = true;
                    return s;
                });
                await room.save();
            }

            const email = (booking.userId as any)?.email || "guest@example.com";
            await sendETicket(email, booking);

            return res.redirect(
                `${process.env.FRONTEND_URL}/payment-result?status=success&code=${booking.bookingCode}`
            );
        } else {
            booking.paymentStatus = "cancelled";
            await booking.save();
            return res.redirect(`${process.env.FRONTEND_URL}/payment-result?status=failed`);
        }
    } catch (err) {
        console.error("❌ Lỗi callback VNPay:", err);
        res.status(500).json({ message: "Lỗi callback VNPay", err });
    }
};

/** 📜 Lấy danh sách vé của người dùng */
export const getMyBookings = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ message: "Chưa đăng nhập" });
            return
        }

        const bookings = await Booking.find({ userId })
            .populate("movieId", "tieuDe anhPoster")
            .populate("roomId", "name type")
            .populate("showtimeId", "date startTime endTime")
            .sort({ createdAt: -1 });

        res.status(200).json({ bookings });
    } catch (error) {
        console.error("❌ Lỗi khi lấy danh sách vé:", error);
        res.status(500).json({ message: "Lỗi khi lấy vé của người dùng", error });
    }
};
