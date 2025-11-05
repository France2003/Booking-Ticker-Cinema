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
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const updateMovies_cron_1 = require("../cron/updateMovies.cron");
const log_1 = require("../cron/log");
const router = (0, express_1.Router)();
router.post("/run-movie-cron", (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, log_1.logToFile)("⚡ Cron thủ công được kích hoạt qua API.");
        yield (0, updateMovies_cron_1.updateMoviesNow)();
        res.json({ message: "Cron movie chạy thành công thủ công!" });
    }
    catch (error) {
        res.status(500).json({ message: "Lỗi khi chạy cron thủ công", error: error.message });
    }
}));
exports.default = router;
