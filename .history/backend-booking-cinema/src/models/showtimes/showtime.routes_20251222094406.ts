import { Router } from "express";
import { requireAuth, isAdmin } from "../../middlewares/auth.middleware";
import { autoShowtimeJob } from "./jobs.autoShowtimeJob";
import { deleteAllShowtimes, getAllShowtimes, getShowtimeById, getShowtimesByMovie, getShowtimesByMovieAndDate, getShowtimesByRoom, getShowtimeSeats } from "./showtime.controller";
const router = Router();
router.post("/auto-generate", requireAuth, isAdmin, async (_, res) => {
  await autoShowtimeJob();
  res.json({ message: "✅ Đã tạo suất chiếu mới cho ngày mai!" });
});
router.get("/", getAllShowtimes);/** 🎬 Lấy chi tiết suất chiếu */

router.get("/:id", getShowtimeById);
router.get("/:id/seats", getShowtimeSeats); // 🎟️ API cho User xem sơ đồ ghế
/** 🎥 Lấy suất chiếu theo phim */
router.get("/movie/:movieId", getShowtimesByMovie);

/** 🗓️ Lấy suất chiếu theo phim + ngày (?date=yyyy-mm-dd) */
router.get("/movie/:movieId/by-date", getShowtimesByMovieAndDate);

/** 🏢 Lấy suất chiếu theo phòng */
router.get("/room/:roomId", getShowtimesByRoom);
router.delete("/all", deleteAllShowtimes);
export default router;