import { Movie } from "../models/movies/movie.model";
import { logToFile } from "./log";
export const updateMoviesNow = async (): Promise<void> => {
    const nowVN = new Date().toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" });
    console.log(`🎬 [CRON] Kiểm tra phim sắp chiếu lúc ${nowVN}`);
    await logToFile(`🎬 [CRON] Kiểm tra phim sắp chiếu lúc ${nowVN}`);
    try {
        // 🕒 Lấy thời gian hiện tại theo múi giờ Việt Nam
        const vnTime = new Date(
            new Date().toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" })
        );
        const startOfDayVN = new Date(vnTime);
        startOfDayVN.setHours(0, 0, 0, 0);
        const endOfDayVN = new Date(startOfDayVN);
        endOfDayVN.setHours(23, 59, 59, 999);
        // 🔍 Tìm các phim cần cập nhật
        const moviesToUpdate = await Movie.find({
            ngayKhoiChieu: { $lte: endOfDayVN },
            trangThai: "sapChieu",
        });
        if (moviesToUpdate.length === 0) {
            const msg = `ℹ️ Không có phim nào cần cập nhật hôm nay (${nowVN})`;
            console.log(msg);
            await logToFile(msg);
            return;
        }
        // 🧩 Cập nhật trạng thái
        const result = await Movie.updateMany(
            { _id: { $in: moviesToUpdate.map((m) => m._id) } },
            { $set: { trangThai: "dangChieu" } }
        );
        const tenPhim = moviesToUpdate.map((m) => m.tieuDe).join(", ");
        const msg = `✅ Đã cập nhật ${result.modifiedCount} phim sang "đang chiếu": ${tenPhim} (ngày ${nowVN})`;
        console.log(msg);
        await logToFile(msg);
    } catch (error: any) {
        const errMsg = `❌ Lỗi khi chạy cron cập nhật phim: ${error.message}`;
        console.error(errMsg);
        await logToFile(errMsg);
    }
};
