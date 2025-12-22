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
export const getShowtimeCountThisWeek = async (req: Request, res: Response): Promise<void> => {
  try {
    const now = new Date();

    // ⏱ Bắt đầu tuần (Thứ 2)
    const startOfWeek = new Date(now);
    const day = startOfWeek.getDay() || 7; // CN = 7
    startOfWeek.setDate(startOfWeek.getDate() - day + 1);
    startOfWeek.setHours(0, 0, 0, 0);
    // ⏱ Kết thúc tuần (CN)
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);
    const count = await Showtime.countDocuments({
      startTime: {
        $gte: startOfWeek,
        $lte: endOfWeek,
      },
    });

    res.json({
      count,
      startOfWeek,
      endOfWeek,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to count weekly showtimes" });
  }
};
export const getRoomCount = async (req: Request, res: Response) => {
  const count = await Room.countDocuments();
  res.json({ count });
};
export const getBookingStats = async (req: Request, res: Response) => {
  const totalBookings = await Booking.countDocuments();
  const pendingBookings = await Booking.countDocuments({
    paymentStatus: "pending",
  });

  res.json({ totalBookings, pendingBookings });
};
export const getBookingCountThisWeek = async (req: Request, res: Response): Promise<void> => {
  try {
    const now = new Date();

    // Thứ 2
    const startOfWeek = new Date(now);
    const day = startOfWeek.getDay() || 7;
    startOfWeek.setDate(startOfWeek.getDate() - day + 1);
    startOfWeek.setHours(0, 0, 0, 0);

    // Chủ nhật
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    const count = await Booking.countDocuments({
      paymentStatus: "paid",
      createdAt: {
        $gte: startOfWeek,
        $lte: endOfWeek,
      },
    });

    res.json({
      count,
      startOfWeek,
      endOfWeek,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to count weekly bookings" });
  }
};
/* ==========================================
    📌 1. HELPER: LẤY NGÀY ĐẦU TUẦN / CUỐI TUẦN
========================================== */
const getWeekRange = (offset = 0) => {
  const today = new Date(Date.now() + 7 * 3600 * 1000);
  today.setHours(23, 59, 59, 999);

  const day = today.getDay(); // 0 = Chủ nhật

  const monday = new Date(today);
  const diff = day === 0 ? -6 : 1 - day; // Nếu CN → lùi 6 ngày
  // offset:
  //   0  = tuần này
  //  -1  = tuần trước
  monday.setDate(today.getDate() + diff + offset * 7);
  monday.setHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  return { monday, sunday };
};

/* ==========================================
  📌 2. HÀM DÙNG CHUNG: LẤY DOANH THU THEO TUẦN
========================================== */

export const getRevenueByWeek = async (start: Date, end: Date) => {
  const raw = await Booking.aggregate([
    {
      $match: {
        paymentStatus: "paid",
        updatedAt: { $gte: start, $lte: end },
      },
    },
    {
      $group: {
        _id: {
          day: { $dayOfMonth: "$updatedAt" },
          month: { $month: "$updatedAt" },
          year: { $year: "$updatedAt" },
        },
        total: { $sum: "$finalPrice" },
      },
    },
  ]);
  const result: any[] = [];
  const cursor = new Date(start);

  for (let i = 0; i < 7; i++) {
    const found = raw.find(
      (r) =>
        r._id.day === cursor.getDate() &&
        r._id.month === cursor.getMonth() + 1 &&
        r._id.year === cursor.getFullYear(),
    );

    result.push({
      label:
        cursor.toLocaleDateString("vi-VN", { weekday: "short" }) +
        ` (${cursor.getDate()}/${cursor.getMonth() + 1})`,
      total: found ? found.total : 0,
    });

    cursor.setDate(cursor.getDate() + 1);
  }

  return result;
};

/* ==========================================
    📌 3. API DOANH THU TUẦN NÀY
========================================== */

export const getRevenueThisWeek = async (req: Request, res: Response) => {
  const { monday, sunday } = getWeekRange(0);
  const result = await getRevenueByWeek(monday, sunday);
  res.json(result);
};

/* ==========================================
    📌 4. API DOANH THU TUẦN TRƯỚC
========================================== */

export const getRevenueLastWeek = async (req: Request, res: Response) => {
  const { monday, sunday } = getWeekRange(-1);
  const result = await getRevenueByWeek(monday, sunday);
  res.json(result);
};

/* ==========================================
    📌 5. API SO SÁNH 2 TUẦN + TREND %
========================================== */

export const compareWeeklyRevenue = async (req: Request, res: Response) => {
  const { monday: m1, sunday: s1 } = getWeekRange(0); // tuần này
  const { monday: m2, sunday: s2 } = getWeekRange(-1); // tuần trước

  const thisWeek = await getRevenueByWeek(m1, s1);
  const lastWeek = await getRevenueByWeek(m2, s2);

  const sumThis = thisWeek.reduce((s, d) => s + d.total, 0);
  const sumLast = lastWeek.reduce((s, d) => s + d.total, 0);

  const trend = sumLast === 0 ? 100 : ((sumThis - sumLast) / sumLast) * 100;

  res.json({
    thisWeek,
    lastWeek,
    sumThis,
    sumLast,
    trend: Number(trend.toFixed(2)),
  });
};

/* ==========================================
     📌 6. DOANH THU 12 THÁNG
========================================== */

export const getRevenueByMonth = async (req: Request, res: Response) => {
  const raw = await Booking.aggregate([
    { $match: { paymentStatus: "paid" } },
    {
      $group: {
        _id: {
          month: { $month: "$updatedAt" },
          year: { $year: "$updatedAt" },
        },
        total: { $sum: "$finalPrice" }
      }
    }
  ]);

  const year = new Date().getFullYear();

  const result = Array.from({ length: 12 }, (_, i) => {
    const found = raw.find(
      (r) => r._id.month === i + 1 && r._id.year === year,
    );

    return {
      label: `T${i + 1}`,
      total: found ? found.total : 0,
    };
  });

  res.json(result);
};

/* ==========================================
    📌 7. DOANH THU THEO KHOẢNG NGÀY
========================================== */

export const getRevenueByRange = async (req: Request, res: Response) => {
  const { from, to } = req.query;
  const startDate = new Date(from as string);
  const endDate = new Date(to as string);

  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(23, 59, 59, 999);

  const raw = await Booking.aggregate([
    {
      $match: {
        paymentStatus: "paid",
        updatedAt: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: {
          day: { $dayOfMonth: "$updatedAt" },
          month: { $month: "$updatedAt" },
          year: { $year: "$updatedAt" },
        },
        total: { $sum: "$finalPrice" },
      },
    },
  ]);

  const days: any[] = [];
  const cursor = new Date(startDate);

  while (cursor <= endDate) {
    const found = raw.find(
      (r) =>
        r._id.day === cursor.getDate() &&
        r._id.month === cursor.getMonth() + 1 &&
        r._id.year === cursor.getFullYear(),
    );

    days.push({
      label:
        cursor.toLocaleDateString("vi-VN", { weekday: "short" }) +
        ` (${cursor.getDate()}/${cursor.getMonth() + 1})`,
      total: found ? found.total : 0,
    });

    cursor.setDate(cursor.getDate() + 1);
  }

  res.json(days);
};

/* =======================
    8. TOP MOVIES
======================= */

export const getTopMovies = async (req: Request, res: Response) => {
  const result = await Booking.aggregate([
    { $match: { paymentStatus: "paid" } },
    {
      $group: {
        _id: "$movieId",
        totalTickets: { $sum: { $size: "$seats" } },
        revenue: { $sum: "$finalPrice" },
      },
    },
    { $sort: { revenue: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: "movies",
        localField: "_id",
        foreignField: "_id",
        as: "movie",
      },
    },
    { $unwind: "$movie" },
  ]);

  res.json(result);
};

/* =======================
    9. DOANH THU THEO PHÒNG
======================= */

export const getRevenueByRoom = async (req: Request, res: Response) => {
  const result = await Booking.aggregate([
    { $match: { paymentStatus: "paid" } },
    {
      $group: {
        _id: "$roomId",
        totalRevenue: { $sum: "$finalPrice" },
      },
    },
    {
      $lookup: {
        from: "rooms",
        localField: "_id",
        foreignField: "_id",
        as: "room",
      },
    },
    { $unwind: "$room" },
    { $sort: { totalRevenue: -1 } },
  ]);

  res.json(result);
};

/* =======================
    10. TOP USERS
======================= */

export const getTopUsers = async (req: Request, res: Response) => {
  const result = await Booking.aggregate([
    { $match: { paymentStatus: "paid" } },
    {
      $group: {
        _id: "$userId",
        totalSpent: { $sum: "$finalPrice" },
        totalOrders: { $sum: 1 },
      },
    },
    { $sort: { totalSpent: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: "$user" },
  ]);

  res.json(result);
};
