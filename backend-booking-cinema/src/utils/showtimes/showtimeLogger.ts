import fs from "fs";
import path from "path";
export const logShowtime = (
    message: string,
    level: "INFO" | "WARN" | "ERROR" = "INFO"
): void => {
    try {
        // 🗂 Thư mục logs
        const logDir = path.join(process.cwd(), "logs");
        if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });

        // 📅 File theo ngày
        const now = new Date();
        const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
            now.getDate()
        ).padStart(2, "0")}`;
        const logFile = path.join(logDir, `showtime-${dateStr}.log`);

        // 🕒 Format timestamp
        const timestamp = now.toLocaleString("vi-VN", { hour12: false });

        // 🧾 Nội dung log
        const logMessage = `[${timestamp}] [${level}] ${message}\n`;

        // ✍️ Ghi ra file
        fs.appendFileSync(logFile, logMessage, "utf8");

        // 🌈 Hiển thị màu khi dev
        if (process.env.NODE_ENV !== "production") {
            let colorCode: string;
            let emoji: string;

            switch (level) {
                case "ERROR":
                    colorCode = "\x1b[31m"; // đỏ
                    emoji = "❌";
                    break;
                case "WARN":
                    colorCode = "\x1b[33m"; // vàng
                    emoji = "⚠️";
                    break;
                default:
                    colorCode = "\x1b[32m"; // xanh lá
                    emoji = "ℹ️";
                    break;
            }

            // console.log(`${colorCode}${emoji} [${timestamp}] ${message}\x1b[0m`);
        }
    } catch (err: unknown) {
        console.error("❌ Lỗi khi ghi log:", err instanceof Error ? err.message : String(err));
    }
};

/**
 * 🧩 Log lỗi trong try/catch, có context rõ ràng
 */
export const logUnknownError = (err: unknown, context = "Unknown Error"): void => {
    const msg =
        err instanceof Error
            ? `${context} → ${err.message}\n${err.stack}`
            : `${context} → ${String(err)}`;
    logShowtime(msg, "ERROR");
};
