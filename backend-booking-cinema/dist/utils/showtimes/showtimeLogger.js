"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logUnknownError = exports.logShowtime = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const logShowtime = (message, level = "INFO") => {
    try {
        // 🗂 Thư mục logs
        const logDir = path_1.default.join(process.cwd(), "logs");
        if (!fs_1.default.existsSync(logDir))
            fs_1.default.mkdirSync(logDir, { recursive: true });
        // 📅 File theo ngày
        const now = new Date();
        const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
        const logFile = path_1.default.join(logDir, `showtime-${dateStr}.log`);
        // 🕒 Format timestamp
        const timestamp = now.toLocaleString("vi-VN", { hour12: false });
        // 🧾 Nội dung log
        const logMessage = `[${timestamp}] [${level}] ${message}\n`;
        // ✍️ Ghi ra file
        fs_1.default.appendFileSync(logFile, logMessage, "utf8");
        // 🌈 Hiển thị màu khi dev
        if (process.env.NODE_ENV !== "production") {
            let colorCode;
            let emoji;
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
    }
    catch (err) {
        console.error("❌ Lỗi khi ghi log:", err instanceof Error ? err.message : String(err));
    }
};
exports.logShowtime = logShowtime;
/**
 * 🧩 Log lỗi trong try/catch, có context rõ ràng
 */
const logUnknownError = (err, context = "Unknown Error") => {
    const msg = err instanceof Error
        ? `${context} → ${err.message}\n${err.stack}`
        : `${context} → ${String(err)}`;
    (0, exports.logShowtime)(msg, "ERROR");
};
exports.logUnknownError = logUnknownError;
