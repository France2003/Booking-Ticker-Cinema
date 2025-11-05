import express, { Application } from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import { connectMongoDB } from "./config/db";
import { ENV } from "./config/env"; // <-- chỉ import ENV, không cần dotenv nữa

// Routers
import authRouter from "./models/auths/auth.router";
import userProfileRouter from "./models/usersprofile/userprofile.router";
import userManagerRoutes from "./models/user/userManager.route";
import movieRouter from "./models/movies/movie.router";
import uploadRouter from "./uploadsrouter";
import showtimeRouter from "./models/showtimes/showtime.routes";
import roomRouter from "./models/room/room.routes";
import cronRouter from "./cron/admin.cron.router";
import promotionRouter from "./models/promotion/promotion.router";
import reviewRouter from "./models/reviews/review.router";
import bookingRouter from "./models/bookings/booking.router";

const app: Application = express();

// CORS
app.use(
  cors({
    origin: ENV.FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.get("/", (_, res) => {
  res.send("🎬 Cinema Backend đang hoạt động OK!");
});
// Routers
app.use("/api/auth", authRouter);
app.use("/api/users", userManagerRoutes);
app.use("/uploads", express.static("uploads"));
app.use("/api/uploads", uploadRouter);
app.use("/api/users/me", userProfileRouter);
app.use("/api/movies", movieRouter);
app.use("/api/cron", cronRouter);
app.use("/api/showtimes", showtimeRouter);
app.use("/api/rooms", roomRouter);
app.use("/api/promotions", promotionRouter);
app.use("/api/reviews", reviewRouter);
app.use("/api/bookings", bookingRouter);

connectMongoDB();

// ✅ Socket.IO
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ENV.FRONTEND_URL,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.locals.io = io;

io.on("connection", (socket) => {
  socket.on("registerUser", (userId: string) => {
    socket.join(`user_${userId}`);
    console.log(`👤 User ${userId} joined room user_${userId}`);
  });
});

// ✅ Start server
server.listen(ENV.PORT, () => {
  console.log("🔧 Environment loaded:", ENV.NODE_ENV);
  console.log("📦 FRONTEND_URL =", ENV.FRONTEND_URL);
  console.log(`🚀 Server is running on ${ENV.BACKEND_URL}`);
});
