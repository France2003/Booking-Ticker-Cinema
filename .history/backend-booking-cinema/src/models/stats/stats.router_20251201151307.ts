import { Router } from "express";
import { isAdmin, requireAuth } from "../../middlewares/auth.middleware";
import {
    getUserCount,
    getShowtimesCount,
    getRoomCount,
    getBookingStats,
    getRevenueThisWeek,
    getRevenueByMonth,
    getRevenueByRange,
    getTopMovies,
    getRevenueByRoom,
    getTopUsers,
} from "./stats.controller";

const router = Router();

router.get("/users", requireAuth, isAdmin, getUserCount);
router.get("/showtimes", requireAuth, isAdmin, getShowtimesCount);
router.get("/room", requireAuth, isAdmin, getRoomCount);
router.get("/bookings", requireAuth, isAdmin, getBookingStats);

router.get("/revenue/week", requireAuth, isAdmin, getRevenueThisWeek);
router.get("/revenue/month", requireAuth, isAdmin, getRevenueByMonth);
router.get("/revenue/range", requireAuth, isAdmin, getRevenueByRange);
/* THỐNG KÊ NÂNG CAO */
router.get("/movies/top", requireAuth, isAdmin, getTopMovies);
router.get("/rooms/revenue", requireAuth, isAdmin, getRevenueByRoom);
router.get("/users/top", requireAuth, isAdmin, getTopUsers);
export default router;
