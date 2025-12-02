import mongoose from "mongoose";
import { ENV } from "./env";
import { startMovieStatusWatcher } from "../models/showtimes/movieStatusWatcher";
import { startMovieStatusCron } from "../cron/movieCron";
import { startAutoShowtimeCron } from "../cron/autoShowtime.cron";
import { initAutoCancelJob } from "../cron/autoCancelBookings";
export const connectMongoDB = async (): Promise<void> => {
  try {
    await mongoose.connect(ENV.MONGO_DB);
    console.log("Connected to MongoDB:", ENV.MONGO_DB);
    startMovieStatusWatcher();   // 👀 Theo dõi thay đổi trạng thái phim
    startMovieStatusCron();      // 🕐 Cron cập nhật trạng thái phim
    startAutoShowtimeCron();     // 🎬 Cron tạo suất chiếu tự động
    initAutoCancelJob(); //kiểm tra vé "pending" quá 24h để hủy.
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1); 
  }
};
