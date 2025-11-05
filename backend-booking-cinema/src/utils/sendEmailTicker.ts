import nodemailer from "nodemailer";
import QRCode from "qrcode";

export const sendETicket = async (to: string, booking: any) => {
    const transporter = nodemailer.createTransport({
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
    const qrImage = await QRCode.toDataURL(qrData);

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

    await transporter.sendMail({
        from: `"Rạp Chiếu Phim" <${process.env.EMAIL_USER}>`,
        to,
        subject: "🎟️ Vé xem phim điện tử của bạn",
        html,
    });
};
