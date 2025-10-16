import fs from "fs-extra";
import path from "path";
const LOG_DIR = path.join(process.cwd(), "logs");
const LOG_FILE = path.join(LOG_DIR, "cron.log");
// Hàm ghi log vào file
export const logToFile = async (message: string): Promise<void> => {
  await fs.ensureDir(LOG_DIR);
  const time = new Date().toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" });
  const logMessage = `[${time}] ${message}\n`;
  await fs.appendFile(LOG_FILE, logMessage, "utf-8");
};
