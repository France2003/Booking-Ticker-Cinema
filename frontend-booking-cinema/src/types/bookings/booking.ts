// 🎬 Thông tin phim
export interface IMovie {
  _id: string;
  tieuDe: string;
  thoiLuong: number;
  anhPoster: string;
  isHot?: boolean;
}

// 🏢 Thông tin phòng chiếu
export interface IRoom {
  _id: string;
  name: string;
  type: "2D" | "3D" | "IMAX";
}

// 💺 Thông tin ghế
export interface ISeat {
  seatNumber: string;
  type: "Normal" | "VIP" | "Double" | "Triple";
  price: number;
  isBooked?: boolean;
}

// ⏰ Suất chiếu
export interface IShowtime {
  _id: string;
  movieId: IMovie;
  roomId: IRoom;
  date: string;
  startTime: string;
  endTime: string;
  seats: ISeat[];
  price: number;
}

// 🎟️ Đặt vé
export interface IBooking {
  _id: string;
  bookingCode: string;

  // 💰 Giá gốc, giảm giá, tổng sau cùng
  totalPrice: number;
  discount: number;
  finalPrice: number;
  // 🏷️ Mã khuyến mãi (nếu có)
  promotionCode?: string;
  // 🍿 Dịch vụ đi kèm
  extraServices?: {
    popcorn?: boolean;
    drink?: boolean;
    combo?: boolean;
  };
  paymentStatus: "pending" | "paid" | "cancelled";
  paymentMethod?: "MoMo" | "QR Banking" | "Chuyển khoản" | "Tiền mặt";
  transactionNote?: string;
  seats: string[];
  createdAt: string;
  updatedAt?: string;

  showtimeId: {
    _id: string;
    date: string;
    startTime: string;
    endTime: string;
  };

  movieId?: {
    _id: string;
    tieuDe: string;
    anhPoster: string;
  };

  roomId?: {
    _id: string;
    name: string;
    type: "2D" | "3D" | "IMAX";
  };

  // 👤 Người dùng (populate)
  userId?: {
    _id: string;
    fullname: string;
    email: string;
    phone: string;
  };
}
