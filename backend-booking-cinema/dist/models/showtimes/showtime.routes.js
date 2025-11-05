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
const express_1 = require("express");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const jobs_autoShowtimeJob_1 = require("./jobs.autoShowtimeJob");
const showtime_controller_1 = require("./showtime.controller");
const router = (0, express_1.Router)();
router.post("/auto-generate", auth_middleware_1.requireAuth, auth_middleware_1.isAdmin, (_, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, jobs_autoShowtimeJob_1.autoShowtimeJob)();
    res.json({ message: "✅ Đã tạo suất chiếu mới cho ngày mai!" });
}));
router.get("/", showtime_controller_1.getAllShowtimes); /** 🎬 Lấy chi tiết suất chiếu */
router.get("/:id", showtime_controller_1.getShowtimeById);
router.get("/:id/seats", showtime_controller_1.getShowtimeSeats); // 🎟️ API cho User xem sơ đồ ghế
/** 🎥 Lấy suất chiếu theo phim */
router.get("/movie/:movieId", showtime_controller_1.getShowtimesByMovie);
/** 🗓️ Lấy suất chiếu theo phim + ngày (?date=yyyy-mm-dd) */
router.get("/movie/:movieId/by-date", showtime_controller_1.getShowtimesByMovieAndDate);
/** 🏢 Lấy suất chiếu theo phòng */
router.get("/room/:roomId", showtime_controller_1.getShowtimesByRoom);
router.delete("/all", showtime_controller_1.deleteAllShowtimes);
exports.default = router;
