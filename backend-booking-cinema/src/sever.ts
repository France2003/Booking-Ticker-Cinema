import dotenv from "dotenv";
dotenv.config();
import express, { Application } from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import { connectMongoDB } from "./config/db";
import { ENV } from "./config/env";
// Routers
import authRouter from "./models/auths/auth.router";
import userProfileRouter from "./models/usersprofile/userprofile.router";
import userManagerRoutes from "./models/user/userManager.route";
import movieRouter from "./models/movies/movie.router";
import uploadRouter from "./uploadsrouter";
import showtimeRouter from "./models/showtimes/showtime.routes";
import roomRouter from "./models/room/room.routes";
import cronRouter from "./cron/admin.cron.router";
import promotionRouter from "./models/promotion/promotion.router"
import reviewRouter from "./models/reviews/review.router";
// import bookingRouter from "./models/bookings/booking.router";
const app: Application = express();
app.use(cors({
  origin: ENV.FRONTEND_URL,
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/auth", authRouter); // Đăng nhập / đăng ký
app.use("/api/users", userManagerRoutes); // Quản lý người dùng (admin)
app.use("/uploads", express.static("uploads")); //static file (truy cập ảnh, poster, trailer)
app.use("/api/uploads", uploadRouter); //phim
app.use("/api/users/me", userProfileRouter);
app.use("/api/movies", movieRouter);// CRUD phim
app.use("/api/cron", cronRouter);// Cron routes
app.use("/api/showtimes", showtimeRouter);// CRUD suất chiếu
app.use("/api/rooms", roomRouter);// CRUD phòng chiếu
app.use("/api/promotions", promotionRouter);
app.use("/api/reviews", reviewRouter);
// app.use("/api/bookings", bookingRouter);
connectMongoDB();
// ✅ Tạo HTTP server để gắn Socket.IO
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ENV.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});
// ✅ Gắn io để controller dùng
app.locals.io = io;
// 🧩 Lắng nghe client kết nối
io.on("connection", (socket) => {
  socket.on("registerUser", (userId: string) => {
    socket.join(`user_${userId}`);
    console.log(`👤 User ${userId} joined room user_${userId}`);
  });
  socket.on("disconnect", () => {
  });
});
server.listen(ENV.PORT, () => {
  console.log(`Server is running on port: ${ENV.PORT}`);
});
