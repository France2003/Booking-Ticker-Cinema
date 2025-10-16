import dotenv from "dotenv";
dotenv.config();
import express, { Application } from "express";
import cors from "cors";
import { connectMongoDB } from "./config/db";
import { ENV } from "./config/env";
import authRouter from "./models/auths/auth.router";
import userProfileRouter from "./models/usersprofile/userprofile.router";
import userManagerRoutes from "./models/user/userManager.route";
import movieRouter from "./models/movies/movie.router";
import uploadRouter from "./uploadsrouter";
// import userAvatarRouter from "./models/usersprofile/userprofile.upload";
import { startMovieStatusCron } from "./cron/movieCron";
import cronRouter from "./cron/admin.cron.router";
const app: Application = express();
app.use(cors({
  origin: ENV.FRONTEND_URL,
  credentials: true,
  methods: ["GET", "POST", "PUT","PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/auth", authRouter); // Đăng nhập / đăng ký
app.use("/api/users", userManagerRoutes); // Quản lý người dùng (admin)
app.use("/uploads", express.static("uploads")); //static file (truy cập ảnh, poster, trailer)
app.use("/api/uploads", uploadRouter); //phim
app.use("/api/users/me", userProfileRouter);
// app.use("/api/uploads", userAvatarRouter);
app.use("/api/movies", movieRouter);// CRUD phim
app.use("/api/cron", cronRouter);// Cron routes
connectMongoDB();
startMovieStatusCron();
app.listen(ENV.PORT, () => {
  console.log(`Server is running on port: ${ENV.PORT}`);
});
