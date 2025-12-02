// src/utils/logger.ts
import fs from "fs";
import path from "path";

const logDir = path.join(process.cwd(), "logs");
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);

const logFile = path.join(logDir, "booking-cron.log");

export const writeLog = (message: string): void => {
    const time = new Date().toLocaleString("vi-VN");
    const line = `[${time}] ${message}\n`;
    fs.appendFileSync(logFile, line, { encoding: "utf8" });
};
