import { Request, Response } from "express";
import { AuthRequest } from "../../middlewares/auth.middleware";
import { Booking } from "./booking.model";
import { Showtime } from "../showtimes/showtime.model";
import { Room } from "../room/room.model";
import PromotionSchema from "../promotion/promotion.model";
import { sendCancelEmail, sendETicket, sendPaymentSuccessEmail } from "../../utils/sendEmailTicker";
import mongoose from "mongoose";
import { nanoid } from "nanoid";
import { writeLog } from "./booking.logger";
export const createBooking = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        const {
            showtimeId,
            selectedSeats,
            moviePoster,
            movieTitle,
            paymentMethod,
            extraServices,
            promotionCode,
        } = req.body;

        if (!userId)
            return void res.status(401).json({ message: "Chưa đăng nhập" });

        if (!showtimeId || !Array.isArray(selectedSeats) || selectedSeats.length === 0)
            return void res.status(400).json({ message: "Thiếu thông tin suất chiếu hoặc ghế" });

        // 🎬 Lấy suất chiếu
        const showtime = await Showtime.findById(showtimeId)
            .populate("roomId")
            .populate("movieId")
            .lean();

        if (!showtime)
            return void res.status(404).json({ message: "Không tìm thấy suất chiếu" });

        const room = await Room.findById(showtime.roomId);
        if (!room)
            return void res.status(404).json({ message: "Không tìm thấy phòng chiếu" });

        // 🪑 Kiểm tra ghế trùng
        const existing = await Booking.find({
            showtimeId,
            seats: { $in: selectedSeats },
            paymentStatus: { $in: ["pending", "paid"] },
            $or: [
                { expiresAt: { $gt: new Date() } },
                { expiresAt: { $exists: false } }, // ✅ Fix: tránh null type
            ],
        });

        if (existing.length > 0) {
            const takenSeats = existing.flatMap((b) => b.seats);
            return void res.status(400).json({
                message: "Một số ghế đã được giữ hoặc đặt trước!",
                seats: takenSeats,
            });
        }

        // 💰 Tính giá vé
        const showtimeDoc = await Showtime.findById(showtimeId).lean();
        let basePrice = 0;
        if (showtimeDoc && showtimeDoc.bookedSeats?.length) {
            const seatMap = new Map(
                showtimeDoc.bookedSeats.map((s: any) => [s.seatNumber, s.price || showtimeDoc.price])
            );
            basePrice = selectedSeats.reduce(
                (sum, s) => sum + (seatMap.get(s) || showtimeDoc.price || 0),
                0
            );
        } else {
            basePrice = (showtime as any).price * selectedSeats.length;
        }
        const servicePrices = { popcorn: 25000, drink: 15000, combo: 35000 };
        const extraTotal = Object.entries(extraServices || {}).reduce(
            (sum, [k, v]) => sum + (v ? servicePrices[k as keyof typeof servicePrices] : 0),
            0
        );

        let discount = 0;
        let appliedPromo: any = null;

        // 🎟️ Áp dụng khuyến mãi
        if (promotionCode) {
            const promo = await PromotionSchema.findOne({ maCode: promotionCode.toUpperCase() });
            if (promo) {
                const now = new Date();
                if (
                    promo.ngayBatDau <= now &&
                    promo.ngayKetThuc >= now &&
                    typeof promo.giaTri === "number" &&
                    promo.giaTri > 0
                ) {
                    discount =
                        promo.loai === "percent"
                            ? Math.round((basePrice * promo.giaTri) / 100)
                            : promo.giaTri;
                    appliedPromo = promo;
                }
            }
        }

        const totalPrice = basePrice + extraTotal;
        const finalPrice = Math.max(totalPrice - discount, 0);

        // 🔢 Sinh mã vé
        let bookingCode: string;
        do {
            bookingCode = "BK" + nanoid(6).toUpperCase();
        } while (await Booking.exists({ bookingCode }));

        // 📝 Lưu vé
        const booking = await Booking.create({
            userId,
            showtimeId,
            roomId: room._id as mongoose.Types.ObjectId, // ✅ Fix type
            movieId: showtime.movieId as mongoose.Types.ObjectId, // ✅ Fix type
            seats: selectedSeats,
            totalPrice,
            discount,
            finalPrice,
            promotionCode: promotionCode?.toUpperCase() || null,
            extraServices,
            bookingCode,
            paymentMethod: paymentMethod?.trim() || "QR Banking",
            paymentStatus: "pending",
            expiresAt: new Date(Date.now() + 5 * 60 * 1000),
            extraInfo: {
                moviePoster: moviePoster || (showtime.movieId as any)?.anhPoster || "",
                movieTitle: movieTitle || (showtime.movieId as any)?.tieuDe || "",
            },
        });

        writeLog(
            `🎫 [Booking] ${req.user?.email || "Khách"} giữ ghế ${selectedSeats.join(", ")} (${bookingCode}) – ${paymentMethod || "QR"} – ${finalPrice.toLocaleString("vi-VN")}đ`
        );

        const io = req.app.locals.io;
        io.emit("newBooking", {
            bookingCode,
            userId,
            showtimeId,
            movieTitle: (showtime.movieId as any)?.tieuDe,
            seats: selectedSeats,
            totalPrice: finalPrice,
            paymentMethod,
            paymentStatus: "pending",
            createdAt: booking.createdAt,
        });

        io.to(showtimeId.toString()).emit("seatUpdate", {
            type: "hold",
            seats: selectedSeats,
            userId,
        });

        try {
            const email = (req.user as any)?.email;
            if (email) await sendETicket(email, booking);
        } catch (err) {
            console.warn("⚠️ Không thể gửi email:", err);
        }

        res.status(200).json({
            message: "Đặt vé thành công!",
            bookingCode,
            totalPrice,
            discount,
            finalPrice,
            expiresAt: booking.expiresAt,
        });

        if (appliedPromo) {
            appliedPromo.daSuDung = (appliedPromo.daSuDung ?? 0) + 1;
            await appliedPromo.save();
        }
    } catch (error) {
        console.error("❌ Lỗi tạo vé:", error);
        res.status(500).json({
            message: "Lỗi tạo vé",
            error: error instanceof Error ? error.message : error,
        });
    }
};
export const updateBookingStatus = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { bookingCode, status, note, transactionId, bankName, paymentMethod } = req.body;
        const adminId = req.user?.id;

        if (!bookingCode || !status)
            return void res.status(400).json({ message: "Thiếu bookingCode hoặc status" });

        const booking = await Booking.findOne({ bookingCode })
            .populate("userId", "email fullname")
            .populate("movieId", "tieuDe anhPoster")
            .populate("showtimeId", "date startTime endTime roomId");

        if (!booking) return void res.status(404).json({ message: "Không tìm thấy vé" });

        const room = await Room.findById(booking.roomId);
        if (!room) return void res.status(404).json({ message: "Không tìm thấy phòng chiếu" });

        const io = req.app.locals.io;

        if (status === "paid") {
            // 🚫 Nếu đã paid rồi thì bỏ qua
            if (booking.paymentStatus === "paid")
                return void res.status(400).json({ message: "Vé đã được thanh toán trước đó." });

            // Kiểm tra ghế bị trùng
            const conflicts = await Booking.find({
                _id: { $ne: booking._id },
                showtimeId: booking.showtimeId,
                seats: { $in: booking.seats },
                paymentStatus: "paid",
            });

            if (conflicts.length > 0) {
                return void res.status(400).json({
                    message: "❌ Một hoặc nhiều ghế đã được người khác duyệt trước!",
                    conflicts: conflicts.map((b) => b.seats),
                });
            }

            // Cập nhật ghế sang booked
            booking.seats.forEach((seatNum) => {
                const seat = room.seats.find((s) => s.seatNumber === seatNum);
                if (seat) seat.isBooked = true;
            });
            await room.save();

            booking.paymentStatus = "paid";
            booking.expiresAt = null; // ❗ Không bị cron huỷ nữa
            booking.transactionId = transactionId || `MANUAL-${Date.now()}`;
            booking.bankName = bankName || "Tại quầy";
            booking.transactionNote = note || "Duyệt vé thành công";
            booking.paymentMethod = paymentMethod || booking.paymentMethod;
            booking.confirmedBy = adminId ? new mongoose.Types.ObjectId(adminId) : null;
            await booking.save();

            // 📧 Gửi mail
            const userEmail = (booking.userId as any)?.email;
            if (userEmail) await sendPaymentSuccessEmail(userEmail, booking);

            // 📢 Emit realtime
            io.to(booking.showtimeId.toString()).emit("seatUpdate", {
                type: "booked",
                seats: booking.seats,
                bookingCode,
            });

            io.to(`user_${booking.userId._id}`).emit("bookingUpdate", {
                bookingCode: booking.bookingCode,
                status: "paid",
                movieTitle: (booking.movieId as any)?.tieuDe,
            });

            console.log(`📢 Emit bookingUpdate → user_${booking.userId._id} [paid]`);
        }
        else if (status === "cancelled") {
            booking.paymentStatus = "cancelled";
            booking.expiresAt = null; // dừng cron động chạm
            await booking.save();

            booking.seats.forEach((seatNum) => {
                const seat = room.seats.find((s) => s.seatNumber === seatNum);
                if (seat) seat.isBooked = false;
            });
            await room.save();

            const userEmail = (booking.userId as any)?.email;
            if (userEmail) await sendCancelEmail(userEmail, booking);

            io.to(booking.showtimeId.toString()).emit("seatUpdate", {
                type: "release",
                seats: booking.seats,
                bookingCode,
            });

            io.to(`user_${booking.userId._id}`).emit("bookingUpdate", {
                bookingCode: booking.bookingCode,
                status: "cancelled",
                movieTitle: (booking.movieId as any)?.tieuDe,
            });

            console.log(`📢 Emit bookingUpdate → user_${booking.userId._id} [cancelled]`);
        }

        writeLog(`✅ [Admin] Cập nhật vé ${bookingCode} → ${status}`);
        res.status(200).json({ message: "Cập nhật vé thành công", booking });
    } catch (error) {
        console.error("❌ Lỗi cập nhật vé:", error);
        res.status(500).json({ message: "Lỗi cập nhật vé", error });
    }
};
export const getMyBookings = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        if (!userId) return void res.status(401).json({ message: "Chưa đăng nhập" });

        const bookings = await Booking.find({ userId })
            .populate("movieId", "tieuDe anhPoster")
            .populate("roomId", "name type")
            .populate("showtimeId", "date startTime endTime bookedSeats price")
            .sort({ createdAt: -1 });

        res.status(200).json({ bookings });
    } catch (error) {
        console.error("❌ Lỗi khi lấy vé:", error);
        res.status(500).json({ message: "Lỗi khi lấy vé", error });
    }
};
export const getAllBookingsForAdmin = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const adminId = req.user?.id;
        if (!adminId) return void res.status(401).json({ message: "Chưa đăng nhập" });

        const bookings = await Booking.find()
            .populate("userId", "fullname email phone")
            .populate("movieId", "tieuDe anhPoster")
            .populate("roomId", "name type")
            .populate("showtimeId", "date startTime endTime bookedSeats price")
            .sort({ createdAt: -1 });

        res.status(200).json({ bookings });
    } catch (error) {
        console.error("❌ Lỗi khi lấy danh sách vé admin:", error);
        res.status(500).json({ message: "Lỗi khi lấy danh sách vé admin", error });
    }
};
export const confirmBooking = async (req: Request, res: Response) => {
    try {
        const { bookingCode } = req.body;
        const booking = await Booking.findOne({ bookingCode })
            .populate("showtimeId", "_id")
            .populate("userId", "email");
        if (!booking)
            return res.status(404).json({ message: "Không tìm thấy vé" });
        // 🔍 Check ghế đã bị người khác thanh toán chưa
        const paid = await Booking.find({
            showtimeId: booking.showtimeId,
            paymentStatus: "paid",
        }).select("seats");
        const allPaidSeats = paid.flatMap((b) => b.seats);
        const conflict = booking.seats.find((s) => allPaidSeats.includes(s));
        if (conflict) {
            return res.status(400).json({
                message: `Ghế ${conflict} đã được người khác đặt trước.`,
            });
        }
        // ✅ Cập nhật thành paid
        booking.paymentStatus = "paid";
        await booking.save();
        // 🔥 Gửi realtime tới tất cả user cùng suất chiếu
        const io = req.app.locals.io;
        io.to(booking.showtimeId.toString()).emit("seatUpdate", {
            type: "booked",
            seats: booking.seats,
            userId: booking.userId,
        });
        res.json({ message: "Thanh toán thành công", booking });
    } catch (error) {
        console.error("❌ Lỗi confirm booking:", error);
        res.status(500).json({ message: "Lỗi máy chủ" });
    }
};
export const getBookingsByUser = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const bookings = await Booking.find({ userId: id })
            .populate("movieId", "tieuDe anhPoster")
            .populate("roomId", "name type")
            .populate("showtimeId", "date startTime endTime")
            .sort({ createdAt: -1 });

        res.json({ bookings }); // ✅ fix đây: trả về { bookings: [...] }
    } catch (error) {
        console.error("Lỗi khi lấy danh sách vé:", error);
        res.status(500).json({ message: "Lỗi khi lấy danh sách vé" });
    }
};