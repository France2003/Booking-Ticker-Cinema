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
exports.deleteSeatFromRoom = exports.updateSeatInRoom = exports.addSeatToRoom = exports.deleteRoom = exports.updateRoom = exports.createRoom = exports.getAllRooms = void 0;
const room_model_1 = require("../room/room.model");
const room_validator_1 = require("../../utils/room/room.validator");
/** Lấy tất cả phòng */
const getAllRooms = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const rooms = yield room_model_1.Room.find();
        res.json(rooms);
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
});
exports.getAllRooms = getAllRooms;
/** Tạo phòng */
const createRoom = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, type } = req.body;
        // 🧩 Kiểm tra đầu vào
        if (!name || !type) {
            res.status(400).json({ message: "Thiếu thông tin phòng (name, type)" });
            return;
        }
        // 🔠 Chuẩn hóa type (phòng)
        const typeKey = type.toUpperCase();
        // ⚙️ Cấu hình cố định
        const rows = 10; // A → J
        const seatsPerRow = 16;
        const alphabet = "ABCDEFGHIJ";
        // 💰 Giá cơ sở cho từng loại phòng
        const BASE_PRICE = {
            "2D": 80000,
            "3D": 100000,
            "IMAX": 130000,
        };
        // 🎟️ Hệ số nhân cho từng loại ghế
        const MULTIPLIER = {
            Normal: 1.0,
            VIP: 1.3,
            Double: 1.2,
            Triple: 1.5,
        };
        // ✅ Lấy giá cơ sở đúng type, fallback nếu type sai
        const basePrice = BASE_PRICE[typeKey] || 80000;
        const seats = [];
        // 🪑 Sinh ghế theo quy tắc
        for (let r = 0; r < rows; r++) {
            const rowLetter = alphabet[r];
            for (let c = 1; c <= seatsPerRow; c++) {
                const seatNumber = `${rowLetter}${c}`;
                let seatType = "Normal";
                // 🎬 Ghế VIP ở giữa (D–F)
                if (["D", "E", "F"].includes(rowLetter)) {
                    seatType = "VIP";
                }
                // 🎬 Hàng I → ghế đôi
                else if (rowLetter === "I") {
                    if ((c >= 3 && c <= 4) ||
                        (c >= 7 && c <= 8) ||
                        (c >= 12 && c <= 13)) {
                        seatType = "Double";
                    }
                }
                // 🎬 Hàng J → ghế ba
                else if (rowLetter === "J") {
                    if ((c >= 4 && c <= 6) || (c >= 10 && c <= 12)) {
                        seatType = "Triple";
                    }
                }
                // 💰 Tính giá chính xác (không chia 1000)
                const finalPrice = Math.round(basePrice * MULTIPLIER[seatType]);
                // 🪑 Push vào danh sách ghế
                seats.push({
                    seatNumber,
                    type: seatType,
                    price: finalPrice,
                    isBooked: false,
                });
            }
        }
        // 🏗️ Tạo phòng trong DB
        const room = yield room_model_1.Room.create({
            name,
            type: typeKey,
            totalSeats: seats.length,
            seats,
        });
        console.log(`✅ Phòng ${name} (${typeKey}) tạo thành công!`);
        console.log(`💰 Base Price: ${basePrice.toLocaleString()}đ`);
        console.log(`🪑 Tổng ghế: ${seats.length}`);
        res.status(201).json({
            message: "✅ Tạo phòng và ghế mặc định thành công",
            room,
        });
    }
    catch (error) {
        console.error("❌ Lỗi tạo phòng:", error);
        res.status(500).json({ message: "Lỗi server khi tạo phòng", error });
    }
});
exports.createRoom = createRoom;
/** Cập nhật phòng */
const updateRoom = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { error } = room_validator_1.updateRoomSchema.validate(req.body, { abortEarly: false });
        if (error) {
            res.status(400).json({
                message: "Dữ liệu không hợp lệ",
                errors: error.details.map((e) => e.message),
            });
            return;
        }
        const room = yield room_model_1.Room.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!room) {
            res.status(404).json({ message: "Không tìm thấy phòng" });
            return;
        }
        res.json({ message: "Cập nhật phòng thành công", room });
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
});
exports.updateRoom = updateRoom;
/** Xóa phòng */
const deleteRoom = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const deleted = yield room_model_1.Room.findByIdAndDelete(req.params.id);
        if (!deleted) {
            res.status(404).json({ message: "Không tìm thấy phòng" });
            return;
        }
        res.json({ message: "Đã xóa phòng chiếu" });
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
});
exports.deleteRoom = deleteRoom;
/** Thêm ghế vào phòng */
const addSeatToRoom = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { roomId } = req.params;
        const { seatNumber, type, price } = req.body;
        if (!seatNumber || !type || !price) {
            res.status(400).json({ message: "Thiếu thông tin ghế" });
            return;
        }
        const room = yield room_model_1.Room.findById(roomId);
        if (!room) {
            res.status(404).json({ message: "Không tìm thấy phòng" });
            return;
        }
        const exists = room.seats.some((s) => s.seatNumber === seatNumber);
        if (exists) {
            res.status(400).json({ message: "Ghế đã tồn tại" });
            return;
        }
        room.seats.push({ seatNumber, type, price, isBooked: false });
        room.totalSeats = room.seats.length;
        yield room.save();
        res.status(201).json({ message: "Thêm ghế thành công", room });
        return;
    }
    catch (error) {
        console.error("❌ Lỗi thêm ghế:", error);
        res.status(500).json({ message: "Lỗi server khi thêm ghế", error });
    }
});
exports.addSeatToRoom = addSeatToRoom;
/** Cập nhật ghế */
const updateSeatInRoom = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { roomId, seatNumber } = req.params;
        const { type, price } = req.body;
        const room = yield room_model_1.Room.findById(roomId);
        if (!room) {
            res.status(404).json({ message: "Không tìm thấy phòng" });
            return;
        }
        const seat = room.seats.find((s) => s.seatNumber === seatNumber);
        if (!seat) {
            res.status(404).json({ message: "Không tìm thấy ghế" });
            return;
        }
        seat.type = type !== null && type !== void 0 ? type : seat.type;
        seat.price = price !== null && price !== void 0 ? price : seat.price;
        yield room.save();
        res.status(200).json({ message: "Cập nhật ghế thành công", room });
    }
    catch (error) {
        console.error("❌ Lỗi cập nhật ghế:", error);
        res.status(500).json({ message: "Lỗi server khi cập nhật ghế", error });
    }
});
exports.updateSeatInRoom = updateSeatInRoom;
/** Xóa ghế */
const deleteSeatFromRoom = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { roomId, seatNumber } = req.params;
        const room = yield room_model_1.Room.findById(roomId);
        if (!room) {
            res.status(404).json({ message: "Không tìm thấy phòng" });
            return;
        }
        room.seats = room.seats.filter((s) => s.seatNumber !== seatNumber);
        room.totalSeats = room.seats.length;
        yield room.save();
        res.status(200).json({ message: "Xóa ghế thành công", room });
    }
    catch (error) {
        console.error("❌ Lỗi xóa ghế:", error);
        res.status(500).json({ message: "Lỗi server khi xóa ghế", error });
    }
});
exports.deleteSeatFromRoom = deleteSeatFromRoom;
