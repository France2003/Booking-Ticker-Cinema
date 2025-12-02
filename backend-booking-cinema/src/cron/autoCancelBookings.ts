import cron from "node-cron";
import dayjs from "dayjs";
import { Booking } from "../models/bookings/booking.model";
import { sendCancelEmail } from "../utils/sendEmailTicker";
import { writeLog } from "../models/bookings/booking.logger";
/** 🧾 Tự động hủy vé chưa thanh toán sau 24 giờ (production mode) */
export const initAutoCancelJob = () => {
    // "0 * * * *" nghĩa là chạy mỗi 1 giờ (đầu mỗi giờ)
    cron.schedule("0 * * * *", async () => {
        const now = new Date();
        writeLog("───────────────────────────────────────────────");
        writeLog(`🕐 [Cron] Bắt đầu kiểm tra vé chưa thanh toán lúc: ${now.toLocaleString("vi-VN")}`);

        try {
            // 🔍 Tìm các vé pending quá 24 giờ
            const expiredBookings = await Booking.find({
                paymentStatus: "pending",
                createdAt: { $lte: dayjs(now).subtract(24, "hour").toDate() },
            })
                .populate("userId", "email fullname")
                .populate("movieId", "tieuDe");

            if (expiredBookings.length === 0) {
                writeLog("✅ [Cron] Không có vé nào cần hủy (mọi thứ ổn định).");
                return;
            }

            writeLog(`⚠️ [Cron] Tìm thấy ${expiredBookings.length} vé quá hạn 24 giờ cần hủy:`);

            for (const booking of expiredBookings) {
                const movieTitle = (booking.movieId as any)?.tieuDe || "Không rõ";
                writeLog(`   → ${booking.bookingCode} (${movieTitle})`);

                booking.paymentStatus = "cancelled";
                booking.transactionNote =
                    "Vé bị hủy do quá 24 giờ chưa thanh toán";
                await booking.save();
                // 📧 Gửi email thông báo hủy
                const email = (booking.userId as any)?.email;
                if (email) {
                    await sendCancelEmail(email, booking);
                    writeLog(`📨 [Cron] Đã gửi email hủy vé đến: ${email}`);
                } else {
                    writeLog(`⚠️ [Cron] Vé ${booking.bookingCode} không có email người dùng.`);
                }
            }

            writeLog("✅ [Cron] Hoàn tất xử lý hủy vé quá hạn 24 giờ.\n");
        } catch (err) {
            writeLog(`❌ [Cron] Lỗi trong quá trình kiểm tra hủy vé: ${err}`);
        }
    });

    writeLog("🚀 Cron job 'autoCancelBookings' đã được khởi động (mỗi 1 giờ).");
};
