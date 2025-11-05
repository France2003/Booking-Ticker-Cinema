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
exports.startAutoShowtimeCron = void 0;
const node_cron_1 = __importDefault(require("node-cron"));
const jobs_autoShowtimeJob_1 = require("../models/showtimes/jobs.autoShowtimeJob");
const showtimeLogger_1 = require("../utils/showtimes/showtimeLogger");
let isRunning = false;
const startAutoShowtimeCron = () => {
    if (isRunning) {
        (0, showtimeLogger_1.logShowtime)("⚠️ CRON đã khởi động, bỏ qua lần khởi tạo trùng.");
        return;
    }
    isRunning = true;
    (0, showtimeLogger_1.logShowtime)("🚀 Khởi động CRON tự động tạo suất chiếu...");
    (0, jobs_autoShowtimeJob_1.autoShowtimeJob)()
        .then(() => (0, showtimeLogger_1.logShowtime)("✅ Suất chiếu ban đầu đã được tạo."))
        .catch((err) => (0, showtimeLogger_1.logShowtime)(`❌ Lỗi khi khởi tạo suất chiếu: ${err}`, "ERROR"));
    node_cron_1.default.schedule("30 0 * * *", () => __awaiter(void 0, void 0, void 0, function* () {
        const now = new Date();
        const weekday = now.getDay();
        (0, showtimeLogger_1.logShowtime)(`\n🕛 CRON (${now.toLocaleString("vi-VN")}) — ${weekday === 1 ? "Thứ Hai (reset tuần)" : "Bổ sung giữa tuần"}`);
        try {
            yield (0, jobs_autoShowtimeJob_1.autoShowtimeJob)();
            (0, showtimeLogger_1.logShowtime)(weekday === 1
                ? "✅ CRON: Đã tạo / clone tuần mới thành công!"
                : "✅ CRON: Đã bổ sung / đồng bộ lịch chiếu giữa tuần!");
        }
        catch (err) {
            (0, showtimeLogger_1.logShowtime)(`❌ CRON lỗi: ${err}`, "ERROR");
        }
    }));
};
exports.startAutoShowtimeCron = startAutoShowtimeCron;
