"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectMongoDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const env_1 = require("./env");
const movieStatusWatcher_1 = require("../models/showtimes/movieStatusWatcher");
const movieCron_1 = require("../cron/movieCron");
const autoShowtime_cron_1 = require("../cron/autoShowtime.cron");
const connectMongoDB = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield mongoose_1.default.connect(env_1.ENV.MONGO_DB);
        console.log("Connected to MongoDB:", env_1.ENV.MONGO_DB);
        (0, movieStatusWatcher_1.startMovieStatusWatcher)(); // 👀 Theo dõi thay đổi trạng thái phim
        (0, movieCron_1.startMovieStatusCron)(); // 🕐 Cron cập nhật trạng thái phim
        (0, autoShowtime_cron_1.startAutoShowtimeCron)(); // 🎬 Cron tạo suất chiếu tự động
    }
    catch (error) {
        console.error("MongoDB connection error:", error);
        process.exit(1);
    }
});
exports.connectMongoDB = connectMongoDB;
