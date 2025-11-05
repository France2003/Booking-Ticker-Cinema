"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const db_1 = require("./config/db");
const env_1 = require("./config/env");
// Routers
const auth_router_1 = __importDefault(require("./models/auths/auth.router"));
const userprofile_router_1 = __importDefault(require("./models/usersprofile/userprofile.router"));
const userManager_route_1 = __importDefault(require("./models/user/userManager.route"));
const movie_router_1 = __importDefault(require("./models/movies/movie.router"));
const uploadsrouter_1 = __importDefault(require("./uploadsrouter"));
const showtime_routes_1 = __importDefault(require("./models/showtimes/showtime.routes"));
const room_routes_1 = __importDefault(require("./models/room/room.routes"));
const admin_cron_router_1 = __importDefault(require("./cron/admin.cron.router"));
const promotion_router_1 = __importDefault(require("./models/promotion/promotion.router"));
const review_router_1 = __importDefault(require("./models/reviews/review.router"));
const booking_router_1 = __importDefault(require("./models/bookings/booking.router"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: env_1.ENV.FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use("/api/auth", auth_router_1.default); // Đăng nhập / đăng ký
app.use("/api/users", userManager_route_1.default); // Quản lý người dùng (admin)
app.use("/uploads", express_1.default.static("uploads")); //static file (truy cập ảnh, poster, trailer)
app.use("/api/uploads", uploadsrouter_1.default); //phim
app.use("/api/users/me", userprofile_router_1.default);
app.use("/api/movies", movie_router_1.default); // CRUD phim
app.use("/api/cron", admin_cron_router_1.default); // Cron routes
app.use("/api/showtimes", showtime_routes_1.default); // CRUD suất chiếu
app.use("/api/rooms", room_routes_1.default); // CRUD phòng chiếu
app.use("/api/promotions", promotion_router_1.default);
app.use("/api/reviews", review_router_1.default);
app.use("/api/bookings", booking_router_1.default);
(0, db_1.connectMongoDB)();
// ✅ Tạo HTTP server để gắn Socket.IO
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: env_1.ENV.FRONTEND_URL || "http://localhost:5173",
        methods: ["GET", "POST"],
        credentials: true,
    },
});
// ✅ Gắn io để controller dùng
app.locals.io = io;
// 🧩 Lắng nghe client kết nối
io.on("connection", (socket) => {
    socket.on("registerUser", (userId) => {
        socket.join(`user_${userId}`);
        console.log(`👤 User ${userId} joined room user_${userId}`);
    });
    socket.on("disconnect", () => {
    });
});
server.listen(env_1.ENV.PORT, () => {
    console.log(`Server is running on port: ${env_1.ENV.PORT}`);
});
