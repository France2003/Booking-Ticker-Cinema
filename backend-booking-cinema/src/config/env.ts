import dotenv from "dotenv";
dotenv.config();
if (!process.env.PORT) {
  throw new Error("PORT is not defined in .env file!");
}
if (!process.env.MONGO_DB) {
  throw new Error("MONGO_DB is not defined in .env file!");
}
if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in .env file!");
}
// console.log("process.env.JWT_SECRET:", process.env.JWT_SECRET);

export const ENV = {
  PORT: parseInt(process.env.PORT, 10),
  MONGO_DB: process.env.MONGO_DB,
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:5173",
  JWT_SECRET: process.env.JWT_SECRET || "default_secret", // fallback nếu thiếu
};
