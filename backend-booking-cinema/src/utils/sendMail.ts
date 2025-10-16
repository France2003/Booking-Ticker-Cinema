import nodemailer from "nodemailer";
const sendMail = async (to: string, subject: string, html: string) => {
    try {
        // Tạo transporter
        const transporter = nodemailer.createTransport({
            service: "gmail", 
            auth: {
                user: process.env.EMAIL_USER, 
                pass: process.env.EMAIL_PASS, 
            },
        });
        // Cấu hình mail
        const mailOptions = {
            from: `"Booking Cinema 🎬" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html,
        };
        // Gửi mail
        await transporter.sendMail(mailOptions);
        console.log("Email đã được gửi tới:", to);
    } catch (error) {
        console.error("Lỗi gửi email:", error);
        throw new Error("Không thể gửi email. Vui lòng thử lại sau!");
    }
};
export default sendMail;
