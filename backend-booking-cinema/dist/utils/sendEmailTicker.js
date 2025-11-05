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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendETicket = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const qrcode_1 = __importDefault(require("qrcode"));
const sendETicket = (to, booking) => __awaiter(void 0, void 0, void 0, function* () {
    const transporter = nodemailer_1.default.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });
    const qrData = `
  Vé xem phim - Mã: ${booking.bookingCode}
  Phim: ${booking.movieId.tieuDe}
  Ghế: ${booking.seats.join(", ")}
  Tổng tiền: ${booking.totalPrice.toLocaleString("vi-VN")}đ
  `;
    const qrImage = yield qrcode_1.default.toDataURL(qrData);
    const html = `
    <h2>🎟️ Vé xem phim điện tử</h2>
    <p>Cảm ơn bạn đã đặt vé tại Rạp Chiếu Phim!</p>
    <ul>
      <li><b>Mã vé:</b> ${booking.bookingCode}</li>
      <li><b>Phim:</b> ${booking.movieId.tieuDe}</li>
      <li><b>Ghế:</b> ${booking.seats.join(", ")}</li>
      <li><b>Tổng tiền:</b> ${booking.totalPrice.toLocaleString("vi-VN")}đ</li>
    </ul>
    <p>Quét mã QR khi đến rạp:</p>
    <img src="${qrImage}" />
    <hr/>
    <p style="color:gray">BookingCinema 2025 ©</p>
  `;
    yield transporter.sendMail({
        from: `"Rạp Chiếu Phim" <${process.env.EMAIL_USER}>`,
        to,
        subject: "🎟️ Vé xem phim điện tử của bạn",
        html,
    });
});
exports.sendETicket = sendETicket;
