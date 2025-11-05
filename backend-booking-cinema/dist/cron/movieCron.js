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
exports.startMovieStatusCron = void 0;
//lên lịch (cron job)
const node_cron_1 = __importDefault(require("node-cron"));
const updateMovies_cron_1 = require("../cron/updateMovies.cron");
const log_1 = require("./log");
const startMovieStatusCron = () => {
    // 🕐 Lên lịch chạy mỗi phút (test). Khi deploy thật thì nên đổi thành: "0 0 * * *"
    node_cron_1.default.schedule("30 8 * * *", // chạy lúc 8:30 sáng mỗi ngày
    () => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, updateMovies_cron_1.updateMoviesNow)();
    }), { timezone: "Asia/Ho_Chi_Minh" });
    console.log("🕐 Cron job 'updateMovies' khởi động");
    (0, log_1.logToFile)("🚀 Cron job 'updateMovies' đã được khởi động thành công.");
};
exports.startMovieStatusCron = startMovieStatusCron;
