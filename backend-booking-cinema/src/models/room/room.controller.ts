import { Request, Response } from "express";
import { Room } from "../room/room.model";
import { createRoomSchema, updateRoomSchema } from "../../utils/room/room.validator";
/** Lấy tất cả phòng */
export const getAllRooms = async (req: Request, res: Response): Promise<void> => {
    try {
        const rooms = await Room.find();
        res.json(rooms);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
};
/** Tạo phòng */
export const createRoom = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, type } = req.body;
        if (!name || !type) {
            res.status(400).json({ message: "Thiếu thông tin phòng" });
            return;
        }

        // ⚙️ Cấu hình
        const rows = 10; // A → J
        const seatsPerRow = 16;
        const alphabet = "ABCDEFGHIJ";
        const seats = [];

        // 🎥 Giá cơ sở cho từng loại phòng
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

        // 🎯 Phân bổ ghế theo quy tắc
        for (let r = 0; r < rows; r++) {
            const rowLetter = alphabet[r];

            for (let c = 1; c <= seatsPerRow; c++) {
                const seatNumber = `${rowLetter}${c}`;
                let seatType: "Normal" | "VIP" | "Double" | "Triple" = "Normal";

                // 🎬 Giữa phòng là ghế VIP
                if (["D", "E", "F"].includes(rowLetter)) {
                    seatType = "VIP";
                }

                // 🎬 Hàng I → 3 cụm ghế đôi (mỗi cụm 2 ghế)
                else if (rowLetter === "I") {
                    // Cụm 1: 3-4 | Cụm 2: 7-8 | Cụm 3: 12-13
                    if (
                        (c >= 3 && c <= 4) ||
                        (c >= 7 && c <= 8) ||
                        (c >= 12 && c <= 13)
                    ) {
                        seatType = "Double";
                    }
                }

                // 🎬 Hàng J → 2 cụm ghế ba (mỗi cụm 3 ghế)
                else if (rowLetter === "J") {
                    // Cụm 1: 4-6 | Cụm 2: 10-12
                    if ((c >= 4 && c <= 6) || (c >= 10 && c <= 12)) {
                        seatType = "Triple";
                    }
                }

                // 💰 Tính giá
                const basePrice = BASE_PRICE[type as keyof typeof BASE_PRICE] || 80000;
                const finalPrice = Math.round((basePrice * MULTIPLIER[seatType]) / 1000) * 1000;
                // 🪑 Tạo ghế
                seats.push({
                    seatNumber,
                    type: seatType,
                    price: finalPrice,
                    isBooked: false,
                });
            }
        }

        // 🏠 Tạo phòng
        const room = await Room.create({
            name,
            type,
            totalSeats: seats.length,
            seats,
        });

        res.status(201).json({
            message: "✅ Tạo phòng và ghế mặc định thành công",
            room,
        });
    } catch (error) {
        console.error("❌ Lỗi tạo phòng:", error);
        res.status(500).json({ message: "Lỗi server khi tạo phòng", error });
    }
};

/** Cập nhật phòng */
export const updateRoom = async (req: Request, res: Response): Promise<void> => {
    try {
        const { error } = updateRoomSchema.validate(req.body, { abortEarly: false });
        if (error) {
            res.status(400).json({
                message: "Dữ liệu không hợp lệ",
                errors: error.details.map((e) => e.message),
            })
            return;
        }
        const room = await Room.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!room) {
            res.status(404).json({ message: "Không tìm thấy phòng" });
            return
        }
        res.json({ message: "Cập nhật phòng thành công", room });
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
};
/** Xóa phòng */
export const deleteRoom = async (req: Request, res: Response): Promise<void> => {
    try {
        const deleted = await Room.findByIdAndDelete(req.params.id);
        if (!deleted) {
            res.status(404).json({ message: "Không tìm thấy phòng" });
            return;
        }
        res.json({ message: "Đã xóa phòng chiếu" });
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
};
/** Thêm ghế vào phòng */
export const addSeatToRoom = async (req: Request, res: Response): Promise<void> => {
    try {
        const { roomId } = req.params;
        const { seatNumber, type, price } = req.body;
        if (!seatNumber || !type || !price) {
            res.status(400).json({ message: "Thiếu thông tin ghế" });
            return
        }
        const room = await Room.findById(roomId);
        if (!room) {
            res.status(404).json({ message: "Không tìm thấy phòng" });
            return;
        }
        const exists = room.seats.some((s) => s.seatNumber === seatNumber);
        if (exists) {
            res.status(400).json({ message: "Ghế đã tồn tại" });
            return
        }
        room.seats.push({ seatNumber, type, price, isBooked: false });
        room.totalSeats = room.seats.length;
        await room.save();
        res.status(201).json({ message: "Thêm ghế thành công", room });
        return;
    } catch (error) {
        console.error("❌ Lỗi thêm ghế:", error);
        res.status(500).json({ message: "Lỗi server khi thêm ghế", error });
    }
};
/** Cập nhật ghế */
export const updateSeatInRoom = async (req: Request, res: Response): Promise<void> => {
    try {
        const { roomId, seatNumber } = req.params;
        const { type, price } = req.body;

        const room = await Room.findById(roomId);
        if (!room) {
            res.status(404).json({ message: "Không tìm thấy phòng" });
            return;
        }
        const seat = room.seats.find((s) => s.seatNumber === seatNumber);
        if (!seat) {
            res.status(404).json({ message: "Không tìm thấy ghế" });
            return
        }
        seat.type = type ?? seat.type;
        seat.price = price ?? seat.price;
        await room.save();
        res.status(200).json({ message: "Cập nhật ghế thành công", room });
    } catch (error) {
        console.error("❌ Lỗi cập nhật ghế:", error);
        res.status(500).json({ message: "Lỗi server khi cập nhật ghế", error });
    }
};
/** Xóa ghế */
export const deleteSeatFromRoom = async (req: Request, res: Response): Promise<void> => {
    try {
        const { roomId, seatNumber } = req.params;
        const room = await Room.findById(roomId);
        if (!room) {
            res.status(404).json({ message: "Không tìm thấy phòng" });
            return;
        }
        room.seats = room.seats.filter((s) => s.seatNumber !== seatNumber);
        room.totalSeats = room.seats.length;
        await room.save();
        res.status(200).json({ message: "Xóa ghế thành công", room });
    } catch (error) {
        console.error("❌ Lỗi xóa ghế:", error);
        res.status(500).json({ message: "Lỗi server khi xóa ghế", error });
    }
};
