import axios from "axios";
import crypto from "crypto";
import { Request, Response } from "express";
import { Booking } from "./booking.model";
import { sendPaymentSuccessEmail } from "../../utils/sendEmailTicker";
import { writeLog } from "./booking.logger";

/* ------------------------------------------------------------
💰 1️⃣ Tạo yêu cầu thanh toán MoMo (chuẩn chính thức + test)
------------------------------------------------------------ */
export const momoCreatePayment = async (req: Request, res: Response): Promise<void> => {
    try {
        const { bookingCode } = req.body;
        if (!bookingCode)
            return void res.status(400).json({ message: "Thiếu mã vé (bookingCode)" });

        const booking = await Booking.findOne({ bookingCode }).populate("userId", "email");
        if (!booking)
            return void res.status(404).json({ message: "Không tìm thấy vé" });

        const partnerCode = process.env.MOMO_PARTNER_CODE!;
        const accessKey = process.env.MOMO_ACCESS_KEY!;
        const secretKey = process.env.MOMO_SECRET_KEY!;
        const redirectUrl = `${process.env.FRONTEND_URL}/payment-success?bookingCode=${bookingCode}`;
        const ipnUrl = `${process.env.BACKEND_URL}/api/bookings/momo-callback`;

        const requestId = `${partnerCode}-${Date.now()}`;
        const orderId = bookingCode;
        const orderInfo = `Thanh toán vé xem phim ${bookingCode}`;
        const amount = booking.totalPrice.toString();
        const requestType = "captureWallet";
        const extraData = "";

        // ✅ Tạo chữ ký bảo mật (theo tài liệu MoMo v2)
        const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;
        const signature = crypto.createHmac("sha256", secretKey)
            .update(rawSignature)
            .digest("hex");

        const requestBody = {
            partnerCode,
            accessKey,
            requestId,
            amount,
            orderId,
            orderInfo,
            redirectUrl,
            ipnUrl,
            extraData,
            requestType,
            signature,
            lang: "vi"
        };

        const endpoint = "https://test-payment.momo.vn/v2/gateway/api/create";
        const response = await axios.post(endpoint, requestBody);

        writeLog(`🟢 [MoMo] Gửi yêu cầu thanh toán cho ${bookingCode} (${amount}đ)`);

        if (!response.data?.payUrl) {
            writeLog(`❌ [MoMo] Không nhận được payUrl từ API: ${JSON.stringify(response.data)}`);
            return void res.status(500).json({ message: "Không tạo được link thanh toán MoMo" });
        }

        res.status(200).json({
            bookingCode,
            payUrl: response.data.payUrl,
            deeplink: response.data.deeplink,
            message: "Tạo thanh toán MoMo thành công"
        });
    } catch (error: any) {
        console.error("❌ Lỗi tạo thanh toán MoMo:", error?.response?.data || error);
        writeLog(`❌ [MoMo] Lỗi tạo thanh toán: ${error.message}`);
        res.status(500).json({ message: "Lỗi tạo thanh toán MoMo", error: error.message });
    }
};


/* ------------------------------------------------------------
🔔 2️⃣ Webhook callback từ MoMo (IPN)
------------------------------------------------------------ */
export const momoCallback = async (req: Request, res: Response): Promise<void> => {
    try {
        const { orderId, resultCode, message, amount, transId } = req.body;

        writeLog(`📩 [MoMo Callback] orderId=${orderId} | resultCode=${resultCode} | amount=${amount}`);

        const booking = await Booking.findOne({ bookingCode: orderId })
            .populate("userId", "email")
            .populate("movieId", "tieuDe anhPoster")
            .populate("roomId", "name address type")
            .populate("showtimeId", "startTime endTime date");

        if (!booking) {
            writeLog(`❌ [MoMo] Không tìm thấy vé ${orderId}`);
            return void res.status(404).json({ message: "Không tìm thấy vé" });
        }

        // Idempotent: nếu đã thanh toán rồi thì bỏ qua callback
        if (booking.paymentStatus === "paid") {
            writeLog(`⚠️ [MoMo] Vé ${orderId} đã thanh toán trước đó.`);
            return void res.status(200).json({ result: "already_paid" });
        }

        if (Number(resultCode) === 0) {
            booking.paymentStatus = "paid";
            booking.transactionId = transId?.toString() || `MOMO-${Date.now()}`;
            booking.bankName = "MoMo Wallet";
            booking.transactionNote = `Thanh toán thành công qua MoMo (${amount}đ)`;
            await booking.save();

            writeLog(`✅ [MoMo] Vé ${orderId} thanh toán thành công - ${amount}đ`);

            const email = (booking.userId as any)?.email;
            if (email) {
                await sendPaymentSuccessEmail(email, booking);
                writeLog(`📧 [MoMo] Đã gửi email xác nhận cho ${email}`);
            }

            return void res.status(200).json({ result: "success" });
        } else {
            writeLog(`⚠️ [MoMo] Giao dịch thất bại (${orderId}): ${message}`);
            return void res.status(200).json({ result: "failed", message });
        }
    } catch (err: any) {
        console.error("❌ Lỗi callback MoMo:", err);
        writeLog(`❌ [MoMo] Callback error: ${err.message}`);
        res.status(500).json({ message: "Lỗi callback MoMo", error: err.message });
    }
};
