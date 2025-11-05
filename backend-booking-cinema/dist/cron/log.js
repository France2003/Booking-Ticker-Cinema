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
exports.logToFile = void 0;
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const LOG_DIR = path_1.default.join(process.cwd(), "logs");
const LOG_FILE = path_1.default.join(LOG_DIR, "cron.log");
// Hàm ghi log vào file
const logToFile = (message) => __awaiter(void 0, void 0, void 0, function* () {
    yield fs_extra_1.default.ensureDir(LOG_DIR);
    const time = new Date().toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" });
    const logMessage = `[${time}] ${message}\n`;
    yield fs_extra_1.default.appendFile(LOG_FILE, logMessage, "utf-8");
});
exports.logToFile = logToFile;
