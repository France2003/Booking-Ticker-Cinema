import cron from "node-cron";
import { autoShowtimeJob } from "../models/showtimes/jobs.autoShowtimeJob";
import { logShowtime } from "../utils/showtimes/showtimeLogger";
let isRunning = false;
export const startAutoShowtimeCron = () => {
    if (isRunning) {
        logShowtime("⚠️ CRON đã khởi động, bỏ qua lần khởi tạo trùng.");
        return;
    }
    isRunning = true;
    logShowtime("🚀 Khởi động CRON tự động tạo suất chiếu...");
    autoShowtimeJob()
        .then(() => logShowtime("✅ Suất chiếu ban đầu đã được tạo."))
        .catch((err) => logShowtime(`❌ Lỗi khi khởi tạo suất chiếu: ${err}`, "ERROR"));

    cron.schedule("30 0 * * *", async () => {
        const now = new Date();
        const weekday = now.getDay();

        logShowtime(
            `\n🕛 CRON (${now.toLocaleString("vi-VN")}) — ${weekday === 1 ? "Thứ Hai (reset tuần)" : "Bổ sung giữa tuần"
            }`
        );

        try {
            await autoShowtimeJob();
            logShowtime(
                weekday === 1
                    ? "✅ CRON: Đã tạo / clone tuần mới thành công!"
                    : "✅ CRON: Đã bổ sung / đồng bộ lịch chiếu giữa tuần!"
            );
        } catch (err) {
            logShowtime(`❌ CRON lỗi: ${err}`, "ERROR");
        }
    });
};
