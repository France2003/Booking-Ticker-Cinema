"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const room_controller_1 = require("../room/room.controller");
const router = express_1.default.Router();
router.get("/", room_controller_1.getAllRooms);
router.post("/", auth_middleware_1.requireAuth, auth_middleware_1.isAdmin, room_controller_1.createRoom);
router.put("/:id", auth_middleware_1.requireAuth, auth_middleware_1.isAdmin, room_controller_1.updateRoom);
router.delete("/:id", auth_middleware_1.requireAuth, auth_middleware_1.isAdmin, room_controller_1.deleteRoom);
// Quản lý ghế
router.post("/:roomId/seats", auth_middleware_1.requireAuth, auth_middleware_1.isAdmin, room_controller_1.addSeatToRoom);
router.put("/:roomId/seats/:seatNumber", auth_middleware_1.requireAuth, auth_middleware_1.isAdmin, room_controller_1.updateSeatInRoom);
router.delete("/:roomId/seats/:seatNumber", auth_middleware_1.requireAuth, auth_middleware_1.isAdmin, room_controller_1.deleteSeatFromRoom);
exports.default = router;
