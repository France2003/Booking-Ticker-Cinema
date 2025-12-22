//lên lịch (cron job)
import cron from "node-cron";
import { updateMoviesNow } from "../cron/updateMovies.cron";
import { logToFile } from "./log";
export const startMovieStatusCron = (): void => {
  // 🕐 Lên lịch chạy mỗi phút (test). Khi deploy thật thì nên đổi thành: "0 0 * * *"
  cron.schedule(
    "10 9 * * *", // chạy lúc 8:30 sáng mỗi ngày
    async () => {
      await updateMoviesNow();
    },
    { timezone: "Asia/Ho_Chi_Minh" }
  );
  console.log("🕐 Cron job 'updateMovies' khởi động");
  logToFile("🚀 Cron job 'updateMovies' đã được khởi động thành công.");
};
