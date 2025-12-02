import { Showtime } from "../models/showtimes/showtime.model";
import nodemailer from "nodemailer";
import QRCode from "qrcode";
export const sendETicket = async (to: string, booking: any) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });
    // ✅ Lấy thông tin suất chiếu (đảm bảo có date, startTime, endTime)
    let showtime = booking.showtimeId;
    if (!showtime || !showtime.startTime) {
      const found = await Showtime.findById(booking.showtimeId)
        .select("date startTime endTime")
        .lean();
      showtime = found || {};
    }
    // ✅ Xử lý định dạng ngày và giờ
    let dateStr = "Chưa cập nhật";
    let timeStr = "";
    if (showtime.startTime) {
      const start = new Date(showtime.startTime);
      const end = new Date(showtime.endTime);
      dateStr = new Date(showtime.date || start).toLocaleDateString("vi-VN");
      timeStr = `${start.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      })} - ${end.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    }

    // ✅ QR Check-in vé
    const qrContent = `🎫 Mã vé: ${booking.bookingCode}
🎬 Phim: ${booking.movieId?.tieuDe || booking.extraInfo?.movieTitle}
📅 Ngày: ${dateStr}
🕒 Giờ: ${timeStr}
💺 Ghế: ${booking.seats.join(", ")}
💰 Tổng: ${booking.finalSeatPrice.toLocaleString("vi-VN")} VNĐ`;
    const qrBuffer = await QRCode.toBuffer(qrContent);

    // ✅ QR Thanh toán VietQR
    const vietQRUrl = `https://api.vietqr.io/image/970436-9363977687-sbIIvRi.jpg?accountName=BUI%20DINH%20PHAP&amount=${booking.finalSeatPrice}&addInfo=${encodeURIComponent(
      booking.bookingCode
    )}`;

    // ✅ Giao diện email
    const html = `
      <div style="font-family:'Segoe UI',Arial,sans-serif;background:#f9fafb;padding:30px;">
        <div style="max-width:640px;margin:auto;background:white;border-radius:16px;box-shadow:0 2px 10px rgba(0,0,0,0.1);overflow:hidden;">
          <!-- Header -->
          <div style="background:linear-gradient(90deg,#f97316,#fb923c);padding:20px;text-align:center;color:white;">
            <img src="https://i.pinimg.com/1200x/e0/3a/70/e03a70c9078b128917923a48197aab4d.jpg"
                 alt="FranceCinema"
                 style="width:80px;height:80px;border-radius:50%;object-fit:cover;margin-bottom:10px;" />
            <h2 style="margin:0;font-size:22px;">🎬 Vé Xem Phim Điện Tử</h2>
            <p style="margin:4px 0 0;font-size:14px;">Cảm ơn bạn đã đặt vé tại <b>FranceCinema</b>!</p>
          </div>

          <!-- Info -->
          <div style="padding:24px 28px;">
            <h3 style="text-align:center;color:#374151;margin:0 0 20px;">Thông tin vé của bạn</h3>
            <table style="width:100%;font-size:15px;color:#374151;border-collapse:collapse;">
              <tr><td><b>🎫 Mã vé:</b></td><td>${booking.bookingCode}</td></tr>
              <tr><td><b>🎬 Phim:</b></td><td>${booking.extraInfo?.movieTitle || booking.movieId?.tieuDe}</td></tr>
              <tr><td><b>📅 Ngày chiếu:</b></td><td>${dateStr}</td></tr>
              <tr><td><b>🕒 Giờ chiếu:</b></td><td>${timeStr}</td></tr>
              <tr><td><b>💺 Ghế:</b></td><td>${booking.seats.join(", ")}</td></tr>
              <tr><td><b>💵 Tổng tiền:</b></td><td style="color:#f97316;font-weight:600;">${booking.finalSeatPrice.toLocaleString(
      "vi-VN"
    )} VNĐ</td></tr>
            </table>
          </div>

          <!-- QR Thanh toán -->
          <div style="background:#fff7ed;padding:20px;text-align:center;">
            <h3 style="margin:0 0 10px;color:#ea580c;">💳 Quét mã để thanh toán</h3>
            <img src="${vietQRUrl}" alt="QR Thanh toán" style="width:180px;height:180px;border-radius:12px;border:3px solid #f97316;background:white;" />
            <p style="font-size:13px;color:#6b7280;margin-top:8px;">
              Nội dung: <b>${booking.bookingCode}</b><br/>
              Số tiền: <b>${booking.finalSeatPrice.toLocaleString("vi-VN")}đ</b><br/>
              Tên tài khoản: <b>BUI DINH PHAP</b><br/>
              Ngân hàng: <b>9363977687</b>
            </p>
          </div>

          <!-- QR Check-in -->
          <div style="background:#f3f4f6;padding:20px;text-align:center;">
            <h3 style="margin:0 0 10px;color:#16a34a;">📱 Mã QR Check-in tại rạp</h3>
            <img src="cid:qrCheckin" alt="QR Check-in" style="width:160px;height:160px;border-radius:12px;border:3px solid #16a34a;background:white;" />
            <p style="font-size:13px;color:#6b7280;margin-top:8px;">Trình nhân viên quét mã này để vào rạp.</p>
          </div>

          <!-- Footer -->
          <div style="background:#111827;color:#9ca3af;text-align:center;padding:10px;font-size:12px;">
            FranceCinema © 2025 • Vé hợp lệ khi có mã QR Check-in
          </div>
        </div>
      </div>
    `;

    // ✅ Gửi email
    await transporter.sendMail({
      from: `"FranceCinema 🎬" <${process.env.EMAIL_USER}>`,
      to,
      subject: `🎬 Vé xem phim - ${booking.extraInfo?.movieTitle || booking.movieId?.tieuDe} (${booking.bookingCode})`,
      html,
      attachments: [{ filename: "qr-checkin.png", content: qrBuffer, cid: "qrCheckin" }],
    });

    console.log("✅ Gửi mail vé thành công tới:", to);
  } catch (err: any) {
    console.error("❌ Lỗi gửi mail:", err.message || err);
  }
};
export const sendCancelEmail = async (to: string, booking: any) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });

    const html = `
      <div style="font-family:'Segoe UI',Arial,sans-serif;background:#f9fafb;padding:30px;">
        <div style="max-width:600px;margin:auto;background:white;border-radius:16px;box-shadow:0 2px 8px rgba(0,0,0,0.1);overflow:hidden;">
          <!-- Header -->
          <div style="background:linear-gradient(90deg,#dc2626,#ef4444);padding:18px;text-align:center;color:white;">
            <h2 style="margin:0;">❌ Vé của bạn đã bị hủy</h2>
          </div>

          <div style="padding:24px 28px;color:#374151;">
            <p>Xin chào,</p>
            <p>Vé xem phim <b>${booking.movieId?.tieuDe || "Không rõ phim"}</b> với mã <b>${booking.bookingCode}</b> đã bị hủy do bạn chưa thanh toán trong vòng 24 giờ kể từ khi đặt.</p>
            <p>Nếu bạn vẫn muốn xem phim này, vui lòng đặt vé lại trên hệ thống để đảm bảo chỗ ngồi của bạn.</p>

            <div style="margin-top:20px;padding:10px 15px;border-left:4px solid #ef4444;background:#fef2f2;">
              <b>Lý do:</b> Vé chưa thanh toán trong vòng 24h kể từ thời điểm đặt.
            </div>
          </div>

          <div style="background:#111827;color:#9ca3af;text-align:center;padding:10px 5px;font-size:12px;">
            FranceCinema © 2025 • Xin cảm ơn bạn đã sử dụng dịch vụ
          </div>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: `"FranceCinema 🎬" <${process.env.EMAIL_USER}>`,
      to,
      subject: `❌ Vé bị hủy - ${booking.bookingCode}`,
      html,
    });

    console.log(`📧 Đã gửi mail hủy vé cho ${to}`);
  } catch (err: any) {
    console.error("❌ Lỗi gửi mail hủy vé:", err.message || err);
  }
};
export const sendPaymentSuccessEmail = async (to: string, booking: any) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });

    // 🔹 Thông tin giờ chiếu
    let dateStr = "Chưa cập nhật";
    let timeStr = "";
    if (booking.showtimeId?.startTime) {
      const start = new Date(booking.showtimeId.startTime);
      const end = new Date(booking.showtimeId.endTime);
      dateStr = start.toLocaleDateString("vi-VN");
      timeStr = `${start.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      })} - ${end.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    }

    // 🔸 QR Check-in
    const qrContent = `🎫 Mã vé: ${booking.bookingCode}
🎬 Phim: ${booking.movieId?.tieuDe || booking.extraInfo?.movieTitle}
📅 ${dateStr} | ${timeStr}
💺 Ghế: ${booking.seats.join(", ")}
💵 Tổng: ${booking.finalSeatPrice.toLocaleString("vi-VN")} VNĐ`;

    const qrBuffer = await QRCode.toBuffer(qrContent, { width: 300, margin: 2 });

    // ✅ Chuẩn hóa phương thức thanh toán
    const paymentLabel =
      booking.bankName && booking.bankName.trim() !== ""
        ? booking.bankName
        : "Thanh toán tại quầy";

    const noteText =
      booking.transactionNote && booking.transactionNote.trim() !== ""
        ? booking.transactionNote
        : "Đã xác nhận thanh toán thành công";

    // 🔹 HTML mail
    const html = `
      <div style="font-family:'Segoe UI',Arial,sans-serif;background:#f9fafb;padding:30px;">
        <div style="max-width:640px;margin:auto;background:white;border-radius:16px;box-shadow:0 2px 8px rgba(0,0,0,0.1);overflow:hidden;">
          <div style="background:linear-gradient(90deg,#16a34a,#22c55e);padding:18px;text-align:center;color:white;">
            <h2 style="margin:0;">💳 Thanh toán thành công!</h2>
            <p style="margin:4px 0 0;">Cảm ơn bạn đã thanh toán tại <b>FranceCinema</b></p>
          </div>

          <div style="padding:24px 28px;">
            <h3 style="text-align:center;color:#374151;margin:0 0 20px;">Chi tiết giao dịch</h3>
            <table style="width:100%;font-size:15px;color:#374151;border-collapse:collapse;">
              <tr><td><b>🎫 Mã vé:</b></td><td>${booking.bookingCode}</td></tr>
              <tr><td><b>🎬 Phim:</b></td><td>${booking.movieId?.tieuDe || booking.extraInfo?.movieTitle}</td></tr>
              <tr><td><b>📅 Ngày chiếu:</b></td><td>${dateStr}</td></tr>
              <tr><td><b>🕒 Giờ chiếu:</b></td><td>${timeStr}</td></tr>
              <tr><td><b>💺 Ghế:</b></td><td>${booking.seats.join(", ")}</td></tr>
              <tr><td><b>🎟️ Số vé:</b></td><td>${booking.seats.length}</td></tr>
              <tr><td><b>🏦 Phương thức thanh toán:</b></td><td>${paymentLabel}</td></tr>
              <tr><td><b>🧾 Ghi chú:</b></td><td>${noteText}</td></tr>
            </table>

            <div style="margin-top:25px;text-align:center;">
              <h3 style="color:#16a34a;margin-bottom:10px;">📱 Mã QR Check-in tại rạp</h3>
              <img src="cid:qrCheckin" alt="QR Check-in" style="width:180px;height:180px;border:3px solid #16a34a;border-radius:12px;" />
              <p style="font-size:13px;color:#6b7280;margin-top:6px;">Quét mã này tại quầy để nhận vé vào rạp.</p>
            </div>

            <div style="margin-top:20px;padding:15px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;text-align:center;">
              ✅ <b>Vé của bạn đã được kích hoạt.</b><br/>
              Vui lòng đến rạp trước giờ chiếu ít nhất 15 phút để check-in bằng mã QR này.
            </div>
          </div>

          <div style="background:#111827;color:#9ca3af;text-align:center;padding:10px;font-size:12px;">
            FranceCinema © 2025 • Vé hợp lệ khi có mã QR Check-in
          </div>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: `"FranceCinema 🎬" <${process.env.EMAIL_USER}>`,
      to,
      subject: `🎫 Vé xem phim - ${booking.movieId?.tieuDe || booking.extraInfo?.movieTitle}`,
      html,
      attachments: [{ filename: "qr-checkin.png", content: qrBuffer, cid: "qrCheckin" }],
    });

    console.log(`📨 Đã gửi mail xác nhận thanh toán đến ${to}`);
  } catch (err: any) {
    console.error("❌ Lỗi gửi mail thanh toán:", err.message || err);
  }
};
