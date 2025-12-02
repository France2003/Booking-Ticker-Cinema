"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ENV = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
// 🧩 Tự động load đúng file .env
dotenv_1.default.config({
    path: process.env.NODE_ENV === "production"
        ? path_1.default.resolve(".env.production")
        : path_1.default.resolve(".env"),
});
console.log("🔧 Environment loaded:", process.env.NODE_ENV || "development");
exports.ENV = {
    NODE_ENV: process.env.NODE_ENV || "development",
    PORT: parseInt(process.env.PORT || "3001", 10),
    BACKEND_URL: process.env.BACKEND_URL || "http://localhost:3001",
    FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:5173",
    MONGO_DB: process.env.MONGO_DB || "",
    JWT_SECRET: process.env.JWT_SECRET || "default_secret",
    EMAIL_USER: process.env.EMAIL_USER || "",
    EMAIL_PASS: process.env.EMAIL_PASS || "",
    VNP_TMNCODE: process.env.VNP_TMNCODE || "",
    VNP_HASHSECRET: process.env.VNP_HASHSECRET || "",
    VNP_URL: process.env.VNP_URL || "",
    VNP_RETURNURL: process.env.VNP_RETURNURL ||
        "http://localhost:3001/api/bookings/vnpay-return",
};
