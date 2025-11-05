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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startMovieStatusWatcher = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const movie_model_1 = require("../../models/movies/movie.model");
const createShowtimeForSingleMovie_1 = require("../showtimes/createShowtimeForSingleMovie");
const showtimeLogger_1 = require("../../utils/showtimes/showtimeLogger");
/**
 * 🎬 Watcher: Theo dõi thay đổi trạng thái phim để tự động tạo suất chiếu
 */
const startMovieStatusWatcher = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (mongoose_1.default.connection.readyState !== 1) {
            (0, showtimeLogger_1.logShowtime)("⚠️ MongoDB chưa sẵn sàng, không thể bật watcher.", "ERROR");
            return;
        }
        (0, showtimeLogger_1.logShowtime)("🎬 Bắt đầu theo dõi thay đổi trạng thái phim...");
        // ✅ Chống spam: lưu phim đang xử lý để không chạy trùng
        const processingMovies = new Map();
        const changeStream = movie_model_1.Movie.watch([], { fullDocument: "updateLookup" });
        changeStream.on("change", (change) => __awaiter(void 0, void 0, void 0, function* () {
            var _a;
            try {
                const { operationType, fullDocument, updateDescription } = change;
                if (!fullDocument)
                    return;
                const movieId = fullDocument._id.toString();
                const title = fullDocument.tieuDe || "(Không rõ tiêu đề)";
                const releaseDate = fullDocument.ngayKhoiChieu
                    ? new Date(fullDocument.ngayKhoiChieu).toLocaleDateString("vi-VN")
                    : "chưa rõ";
                // Ngăn gọi trùng trong 10s
                if (processingMovies.has(movieId)) {
                    const lastTime = processingMovies.get(movieId);
                    if (Date.now() - lastTime < 10000)
                        return;
                }
                processingMovies.set(movieId, Date.now());
                /** 🔹 Khi thêm phim mới */
                if (operationType === "insert" && fullDocument.trangThai === "dangChieu") {
                    (0, showtimeLogger_1.logShowtime)(`🚀 Thêm phim mới: ${title} (khởi chiếu ${releaseDate}) → tạo suất chiếu ngay.`);
                    yield (0, createShowtimeForSingleMovie_1.createShowtimeForSingleMovie)(fullDocument);
                    (0, showtimeLogger_1.logShowtime)(`✅ Hoàn tất tạo suất chiếu cho phim mới: ${title}`);
                    return;
                }
                /** 🔹 Khi cập nhật trạng thái sang "đang chiếu" */
                const updatedStatus = (_a = updateDescription === null || updateDescription === void 0 ? void 0 : updateDescription.updatedFields) === null || _a === void 0 ? void 0 : _a.trangThai;
                if (operationType === "update" && updatedStatus === "dangChieu") {
                    (0, showtimeLogger_1.logShowtime)(`🚀 Phim cập nhật sang đang chiếu: ${title} (khởi chiếu ${releaseDate}) → tạo suất chiếu ngay.`);
                    yield (0, createShowtimeForSingleMovie_1.createShowtimeForSingleMovie)(fullDocument);
                    (0, showtimeLogger_1.logShowtime)(`✅ Hoàn tất tạo suất chiếu cho phim cập nhật: ${title}`);
                    return;
                }
            }
            catch (err) {
                (0, showtimeLogger_1.logUnknownError)(err, "Movie watcher change event");
            }
        }));
        changeStream.on("error", (err) => {
            (0, showtimeLogger_1.logUnknownError)(err, "Change stream error");
            (0, showtimeLogger_1.logShowtime)("⚠️ Watcher gặp lỗi — sẽ thử khởi động lại sau 10s.", "WARN");
            setTimeout(exports.startMovieStatusWatcher, 10000);
        });
        changeStream.on("close", () => {
            (0, showtimeLogger_1.logShowtime)("⚠️ Watcher MongoDB bị đóng, đang tự bật lại...");
            setTimeout(exports.startMovieStatusWatcher, 10000);
        });
    }
    catch (err) {
        (0, showtimeLogger_1.logUnknownError)(err, "startMovieStatusWatcher");
    }
});
exports.startMovieStatusWatcher = startMovieStatusWatcher;
