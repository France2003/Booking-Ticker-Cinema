import { UserModel } from "../user/userManager.model";
import { Request, Response } from "express";
import { Booking } from "../bookings/booking.model";
import { Showtime } from "../showtimes/showtime.model";
import { Room } from "../room/room.model";
export const getUserCount = async (req: Request, res: Response) => {
  const count = await UserModel.countDocuments({ role: "user" });
  res.json({ count });
};
export const getShowtimesCount = async (req: Request, res: Response) => {
  const count = await Showtime.countDocuments();
  res.json({ count });
};
export const getRoomCount = async (req: Request, res: Response) => {
  const count = await Room.countDocuments();
  res.json({ count });
};
export const getBookingStats = async (req: Request, res: Response) => {
  const totalBookings = await Booking.countDocuments();
  const pendingBookings = await Booking.countDocuments({ paymentStatus: "pending" });

  res.json({ totalBookings, pendingBookings });
};
export const getRevenueLast7Days = async (req: Request, res: Response) => {
  const today = new Date();
  today.setHours(23, 59, 59, 999);

  const fromDate = new Date(today);
  fromDate.setDate(today.getDate() - 6);
  fromDate.setHours(0, 0, 0, 0);

  const raw = await Booking.aggregate([
    {
      $match: {
        paymentStatus: "paid",
        createdAt: { $gte: fromDate, $lte: today }
      }
    },
    {
      $group: {
        _id: {
          day: { $dayOfMonth: "$createdAt" },
          month: { $month: "$createdAt" },
          year: { $year: "$createdAt" }
        },
        total: { $sum: "$finalPrice" }
      }
    }
  ]);

  // 🔥 BUILD FULL 7-DAY LIST
  const result: any[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);

    const found = raw.find(r =>
      r._id.day === d.getDate() &&
      r._id.month === d.getMonth() + 1 &&
      r._id.year === d.getFullYear()
    );

    result.push({
      label: d.toLocaleDateString("vi-VN", { weekday: "short" }) + " " +
        `(${d.getDate()}/${d.getMonth() + 1})`,
      total: found ? found.total : 0
    });
  }

  res.json(result);
};
export const getRevenueByMonth = async (req: Request, res: Response) => {
  const raw = await Booking.aggregate([
    { $match: { paymentStatus: "paid" } },
    {
      $group: {
        _id: { month: { $month: "$createdAt" }, year: { $year: "$createdAt" } },
        total: { $sum: "$finalPrice" }
      }
    }
  ]);

  const year = new Date().getFullYear();

  const result = Array.from({ length: 12 }, (_, i) => {
    const found = raw.find(r => r._id.month === i + 1 && r._id.year === year);

    return {
      label: `T${i + 1}`,
      total: found ? found.total : 0
    };
  });

  res.json(result);
};
export const getRevenueByRange = async (req: Request, res: Response) => {
  const { from, to } = req.query;

  const startDate = new Date(from as string);
  const endDate = new Date(to as string);

  // full-day time fix
  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(23, 59, 59, 999);

  const raw = await Booking.aggregate([
    {
      $match: {
        paymentStatus: "paid",
        createdAt: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: {
          day: { $dayOfMonth: "$createdAt" },
          month: { $month: "$createdAt" },
          year: { $year: "$createdAt" }
        },
        total: { $sum: "$finalPrice" }
      }
    }
  ]);
  // ===========================
  // Fill đủ ngày trong khoảng
  // ===========================
  const days: any[] = [];
  const cursor = new Date(startDate);

  while (cursor <= endDate) {
    const found = raw.find(
      r =>
        r._id.day === cursor.getDate() &&
        r._id.month === cursor.getMonth() + 1 &&
        r._id.year === cursor.getFullYear()
    );

    days.push({
      label:
        cursor.toLocaleDateString("vi-VN", { weekday: "short" }) +
        ` (${cursor.getDate()}/${cursor.getMonth() + 1})`,
      total: found ? found.total : 0
    });

    cursor.setDate(cursor.getDate() + 1);
  }
  res.json(days);
};
/* =======================
    1. TOP PHIM BÁN CHẠY
======================= */
export const getTopMovies = async (req: Request, res: Response) => {
  const result = await Booking.aggregate([
    { $match: { paymentStatus: "paid" } },
    {
      $group: {
        _id: "$movieId",
        totalTickets: { $sum: { $size: "$seats" } },
        revenue: { $sum: "$finalPrice" }
      }
    },
    { $sort: { revenue: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: "movies",
        localField: "_id",
        foreignField: "_id",
        as: "movie"
      }
    },
    { $unwind: "$movie" }
  ]);

  res.json(result);
};

/* =======================
  2. DOANH THU THEO PHÒNG
======================= */
export const getRevenueByRoom = async (req: Request, res: Response) => {
  const result = await Booking.aggregate([
    { $match: { paymentStatus: "paid" } },
    {
      $group: {
        _id: "$roomId",
        totalRevenue: { $sum: "$finalPrice" }
      }
    },
    {
      $lookup: {
        from: "rooms",
        localField: "_id",
        foreignField: "_id",
        as: "room"
      }
    },
    { $unwind: "$room" },
    { $sort: { totalRevenue: -1 } }
  ]);

  res.json(result);
};

/* =======================
  3. USER CHI TIỀN NHIỀU NHẤT
======================= */
export const getTopUsers = async (req: Request, res: Response) => {
  const result = await Booking.aggregate([
    { $match: { paymentStatus: "paid" } },
    {
      $group: {
        _id: "$userId",
        totalSpent: { $sum: "$finalPrice" },
        totalOrders: { $sum: 1 }
      }
    },
    { $sort: { totalSpent: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "user"
      }
    },
    { $unwind: "$user" }
  ]);

  res.json(result);
};

