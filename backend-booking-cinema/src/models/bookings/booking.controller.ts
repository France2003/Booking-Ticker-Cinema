// import { Request, Response } from "express";
// import { Booking } from "./booking.model";
// import { Showtime } from "../showtimes/showtime.model";
// import { Room } from "../room/room.model";
// import { nanoid } from "nanoid";

// // ✅ Tạo booking
// export const createBooking = async (req: Request, res: Response) => {
//   try {
//     const userId = req.user?._id; // từ middleware
//     const { showtimeId, selectedSeats } = req.body;

//     const showtime = await Showtime.findById(showtimeId)
//       .populate("roomId")
//       .populate("movieId");
//     if (!showtime) return res.status(404).json({ message: "Không tìm thấy suất chiếu" });

//     const room = await Room.findById(showtime.roomId);
//     if (!room) return res.status(404).json({ message: "Không tìm thấy phòng" });

//     // ❗Kiểm tra ghế có trống không
//     const invalidSeats = room.seats.filter(
//       (s) => selectedSeats.includes(s.seatNumber) && s.isBooked
//     );
//     if (invalidSeats.length > 0) {
//       return res.status(400).json({
//         message: "Một số ghế đã được đặt trước!",
//         seats: invalidSeats.map((s) => s.seatNumber),
//       });
//     }

//     // 💰Tính tổng tiền
//     const seatsInfo = room.seats.filter((s) => selectedSeats.includes(s.seatNumber));
//     const totalPrice = seatsInfo.reduce((sum, s) => sum + s.price, 0);

//     // ✅ Cập nhật trạng thái ghế
//     room.seats = room.seats.map((s) =>
//       selectedSeats.includes(s.seatNumber) ? { ...s, isBooked: true } : s
//     );
//     await room.save();

//     // 🪪 Tạo mã vé
//     const bookingCode = "BK-" + nanoid(6).toUpperCase();

//     const booking = await Booking.create({
//       userId,
//       showtimeId,
//       roomId: room._id,
//       movieId: showtime.movieId,
//       seats: selectedSeats,
//       totalPrice,
//       bookingCode,
//     });

//     res.status(201).json({
//       message: "🎟️ Đặt vé thành công!",
//       booking,
//     });
//   } catch (error) {
//     console.error("❌ Lỗi đặt vé:", error);
//     res.status(500).json({ message: "Lỗi server khi đặt vé", error });
//   }
// };

// // ✅ Lấy vé theo người dùng
// export const getMyBookings = async (req: Request, res: Response) => {
//   const userId = req.user?._id;
//   const bookings = await Booking.find({ userId })
//     .populate("movieId", "tieuDe anhPoster")
//     .populate("showtimeId", "date startTime endTime")
//     .sort({ createdAt: -1 });
//   res.json(bookings);
// };
