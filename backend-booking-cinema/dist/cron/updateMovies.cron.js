"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateMoviesNow = void 0;
const movie_model_1 = require("../models/movies/movie.model");
const log_1 = require("./log");
const updateMoviesNow = () => __awaiter(void 0, void 0, void 0, function* () {
    const nowVN = new Date().toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" });
    console.log(`🎬 [CRON] Kiểm tra phim sắp chiếu lúc ${nowVN}`);
    yield (0, log_1.logToFile)(`🎬 [CRON] Kiểm tra phim sắp chiếu lúc ${nowVN}`);
    try {
        // 🕒 Lấy thời gian hiện tại theo múi giờ Việt Nam
        const vnTime = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" }));
        const startOfDayVN = new Date(vnTime);
        startOfDayVN.setHours(0, 0, 0, 0);
        const endOfDayVN = new Date(startOfDayVN);
        endOfDayVN.setHours(23, 59, 59, 999);
        // 🔍 Tìm các phim cần cập nhật
        const moviesToUpdate = yield movie_model_1.Movie.find({
            ngayKhoiChieu: { $lte: endOfDayVN },
            trangThai: "sapChieu",
        });
        if (moviesToUpdate.length === 0) {
            const msg = `ℹ️ Không có phim nào cần cập nhật hôm nay (${nowVN})`;
            console.log(msg);
            yield (0, log_1.logToFile)(msg);
            return;
        }
        // 🧩 Cập nhật trạng thái
        const result = yield movie_model_1.Movie.updateMany({ _id: { $in: moviesToUpdate.map((m) => m._id) } }, { $set: { trangThai: "dangChieu" } });
        const tenPhim = moviesToUpdate.map((m) => m.tieuDe).join(", ");
        const msg = `✅ Đã cập nhật ${result.modifiedCount} phim sang "đang chiếu": ${tenPhim} (ngày ${nowVN})`;
        console.log(msg);
        yield (0, log_1.logToFile)(msg);
    }
    catch (error) {
        const errMsg = `❌ Lỗi khi chạy cron cập nhật phim: ${error.message}`;
        console.error(errMsg);
        yield (0, log_1.logToFile)(errMsg);
    }
});
exports.updateMoviesNow = updateMoviesNow;
