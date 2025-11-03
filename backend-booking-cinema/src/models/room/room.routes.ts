import express from "express";
import { requireAuth, isAdmin } from "../../middlewares/auth.middleware";
import { addSeatToRoom, createRoom, deleteRoom, deleteSeatFromRoom, getAllRooms, updateRoom, updateSeatInRoom } from "../room/room.controller";
const router = express.Router();
router.get("/", getAllRooms);
router.post("/", requireAuth, isAdmin, createRoom);
router.put("/:id", requireAuth, isAdmin, updateRoom);
router.delete("/:id", requireAuth, isAdmin, deleteRoom);
// Quản lý ghế
router.post("/:roomId/seats", requireAuth, isAdmin,addSeatToRoom);
router.put("/:roomId/seats/:seatNumber", requireAuth, isAdmin, updateSeatInRoom);
router.delete("/:roomId/seats/:seatNumber", requireAuth, isAdmin, deleteSeatFromRoom);
export default router;
