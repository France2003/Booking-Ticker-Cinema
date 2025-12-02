import dotenv from "dotenv";
dotenv.config();
import express, { Application } from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import { connectMongoDB } from "./config/db";
import { ENV } from "./config/env";

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
import revenueStatsRouter from "./models/stats/stats.router";
const app: Application = express();
app.use(
  cors({
    origin: ENV.FRONTEND_URL || "http://bookingticker.net",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
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
app.use("/api/admin/stats", revenueStatsRouter);
connectMongoDB();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ENV.FRONTEND_URL || "http://bookingticker.net",
    methods: ["GET", "POST"],
    credentials: true,
  },
});
app.locals.io = io;
const userHeldSeats = new Map<string, { showtimeId: string; seats: string[] }>();

io.on("connection", (socket) => {
  // console.log(`✅ Client connected: ${socket.id}`);
  socket.on("registerUser", (userId: string) => {
    socket.join(`user_${userId}`);
    // console.log(`👤 User ${userId} joined room user_${userId}`);
  });
  socket.on("joinShowtime", (showtimeId: string) => {
    socket.join(showtimeId);
    console.log(`👥 ${socket.id} joined showtime ${showtimeId}`);
  });

  socket.on("holdSeat", ({ showtimeId, seats, userId }) => {
    userHeldSeats.set(socket.id, { showtimeId, seats });
    console.log(`🎟️ ${userId} giữ ghế: ${seats.join(", ")}`);
    socket.to(showtimeId).emit("seatUpdate", {
      type: "hold",
      seats,
      userId,
    });
  });

  socket.on("releaseSeat", ({ showtimeId, seats, userId }) => {
    console.log(`🔓 ${userId} bỏ ghế: ${seats.join(", ")}`);
    const current = userHeldSeats.get(socket.id);
    if (current) {
      current.seats = current.seats.filter((s) => !seats.includes(s));
      if (current.seats.length === 0) userHeldSeats.delete(socket.id);
      else userHeldSeats.set(socket.id, current);
    }
    socket.to(showtimeId).emit("seatUpdate", {
      type: "release",
      seats,
      userId,
    });
  });

  socket.on("disconnect", (reason) => {
    // console.log(`❌ Client disconnected: ${socket.id} (${reason})`);
    // const held = userHeldSeats.get(socket.id);
    // if (held) {
    //   console.log(`💨 Trả ghế bị giữ: ${held.seats.join(", ")}`);
    //   io.to(held.showtimeId).emit("seatUpdate", {
    //     type: "release",
    //     seats: held.seats,
    //   });
    //   userHeldSeats.delete(socket.id);
    // }
  });
});

server.listen(ENV.PORT || 3001, () => {
  console.log(`🚀 Server is running on port: ${ENV.PORT || 3001}`);
});
