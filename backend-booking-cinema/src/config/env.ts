import dotenv from "dotenv";
import path from "path";

// 🧩 Tự động load đúng file .env
dotenv.config({
  path:
    process.env.NODE_ENV === "production"
      ? path.resolve(".env.production")
      : path.resolve(".env"),
});

console.log("🔧 Environment loaded:", process.env.NODE_ENV || "development");

export const ENV = {
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
  VNP_RETURNURL:
    process.env.VNP_RETURNURL ||
    "http://localhost:3001/api/bookings/vnpay-return",
};
