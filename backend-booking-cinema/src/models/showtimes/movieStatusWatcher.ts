import mongoose from "mongoose";
import { Movie } from "../../models/movies/movie.model";
import { createShowtimeForSingleMovie } from "../showtimes/createShowtimeForSingleMovie";
import { logShowtime, logUnknownError } from "../../utils/showtimes/showtimeLogger";

/**
 * 🎬 Watcher: Theo dõi thay đổi trạng thái phim để tự động tạo suất chiếu
 */
export const startMovieStatusWatcher = async () => {
    try {
        if (mongoose.connection.readyState !== 1) {
            logShowtime("⚠️ MongoDB chưa sẵn sàng, không thể bật watcher.", "ERROR");
            return;
        }

        logShowtime("🎬 Bắt đầu theo dõi thay đổi trạng thái phim...");

        // ✅ Chống spam: lưu phim đang xử lý để không chạy trùng
        const processingMovies = new Map<string, number>();

        const changeStream = Movie.watch([], { fullDocument: "updateLookup" });

        changeStream.on("change", async (change) => {
            try {
                const { operationType, fullDocument, updateDescription } = change;
                if (!fullDocument) return;

                const movieId = fullDocument._id.toString();
                const title = fullDocument.tieuDe || "(Không rõ tiêu đề)";
                const releaseDate = fullDocument.ngayKhoiChieu
                    ? new Date(fullDocument.ngayKhoiChieu).toLocaleDateString("vi-VN")
                    : "chưa rõ";

                // Ngăn gọi trùng trong 10s
                if (processingMovies.has(movieId)) {
                    const lastTime = processingMovies.get(movieId)!;
                    if (Date.now() - lastTime < 10_000) return;
                }
                processingMovies.set(movieId, Date.now());

                /** 🔹 Khi thêm phim mới */
                if (operationType === "insert" && fullDocument.trangThai === "dangChieu") {
                    logShowtime(`🚀 Thêm phim mới: ${title} (khởi chiếu ${releaseDate}) → tạo suất chiếu ngay.`);
                    await createShowtimeForSingleMovie(fullDocument);
                    logShowtime(`✅ Hoàn tất tạo suất chiếu cho phim mới: ${title}`);
                    return;
                }

                /** 🔹 Khi cập nhật trạng thái sang "đang chiếu" */
                const updatedStatus = updateDescription?.updatedFields?.trangThai;
                if (operationType === "update" && updatedStatus === "dangChieu") {
                    logShowtime(`🚀 Phim cập nhật sang đang chiếu: ${title} (khởi chiếu ${releaseDate}) → tạo suất chiếu ngay.`);
                    await createShowtimeForSingleMovie(fullDocument);
                    logShowtime(`✅ Hoàn tất tạo suất chiếu cho phim cập nhật: ${title}`);
                    return;
                }
            } catch (err: unknown) {
                logUnknownError(err, "Movie watcher change event");
            }
        });

        changeStream.on("error", (err: unknown) => {
            logUnknownError(err, "Change stream error");
            logShowtime("⚠️ Watcher gặp lỗi — sẽ thử khởi động lại sau 10s.", "WARN");
            setTimeout(startMovieStatusWatcher, 10000);
        });

        changeStream.on("close", () => {
            logShowtime("⚠️ Watcher MongoDB bị đóng, đang tự bật lại...");
            setTimeout(startMovieStatusWatcher, 10000);
        });

    } catch (err: unknown) {
        logUnknownError(err, "startMovieStatusWatcher");
    }
};
