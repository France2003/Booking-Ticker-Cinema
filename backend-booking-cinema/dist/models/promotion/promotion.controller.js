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
exports.increasePromotionUsage = exports.checkPromotionCode = exports.deletePromotion = exports.updatePromotion = exports.getPromotionById = exports.getPromotions = exports.createPromotion = void 0;
const promotion_model_1 = __importDefault(require("./promotion.model"));
// 🟢 Thêm khuyến mãi
const createPromotion = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const anhDaiDien = req.file ? `/uploads/${req.file.filename}` : undefined;
        const promo = new promotion_model_1.default(Object.assign(Object.assign({}, req.body), { anhDaiDien }));
        yield promo.save();
        res.status(201).json({ message: "Tạo khuyến mãi thành công", data: promo });
    }
    catch (error) {
        res.status(400).json({ message: "Lỗi khi tạo khuyến mãi", error });
    }
});
exports.createPromotion = createPromotion;
// 🟡 Lấy danh sách khuyến mãi
const getPromotions = (_, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const promotions = yield promotion_model_1.default.find().sort({ ngayTao: -1 });
        res.json({ data: promotions });
    }
    catch (error) {
        res.status(500).json({ message: "Lỗi khi lấy danh sách", error });
    }
});
exports.getPromotions = getPromotions;
// 🔵 Lấy chi tiết khuyến mãi theo ID
const getPromotionById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const promo = yield promotion_model_1.default.findById(req.params.id);
        if (!promo)
            return void res.status(404).json({ message: "Không tìm thấy khuyến mãi" });
        res.json({ data: promo });
    }
    catch (error) {
        res.status(500).json({ message: "Lỗi khi lấy chi tiết", error });
    }
});
exports.getPromotionById = getPromotionById;
// 🟠 Cập nhật khuyến mãi
const updatePromotion = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const anhDaiDien = req.file ? `/uploads/${req.file.filename}` : undefined;
        const promo = yield promotion_model_1.default.findByIdAndUpdate(req.params.id, Object.assign(Object.assign({}, req.body), (anhDaiDien && { anhDaiDien })), { new: true });
        if (!promo)
            return void res.status(404).json({ message: "Không tìm thấy khuyến mãi" });
        res.json({ message: "Cập nhật thành công", data: promo });
    }
    catch (error) {
        res.status(400).json({ message: "Lỗi khi cập nhật", error });
    }
});
exports.updatePromotion = updatePromotion;
// 🔴 Xoá khuyến mãi
const deletePromotion = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const promo = yield promotion_model_1.default.findByIdAndDelete(req.params.id);
        if (!promo)
            return void res.status(404).json({ message: "Không tìm thấy khuyến mãi" });
        res.json({ message: "Đã xoá khuyến mãi" });
    }
    catch (error) {
        res.status(500).json({ message: "Lỗi khi xoá", error });
    }
});
exports.deletePromotion = deletePromotion;
// 🧩 Kiểm tra mã giảm giá hợp lệ
const checkPromotionCode = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { maCode } = req.body;
        const promo = yield promotion_model_1.default.findOne({ maCode: maCode === null || maCode === void 0 ? void 0 : maCode.toUpperCase() });
        if (!promo)
            return void res.status(404).json({ message: "Mã không tồn tại" });
        const now = new Date();
        if (promo.ngayBatDau > now)
            return void res.status(400).json({ message: "Khuyến mãi chưa bắt đầu" });
        if (promo.ngayKetThuc < now)
            return void res.status(400).json({ message: "Khuyến mãi đã hết hạn" });
        if (promo.gioiHanSuDung && ((_a = promo.daSuDung) !== null && _a !== void 0 ? _a : 0) >= promo.gioiHanSuDung)
            return void res.status(400).json({ message: "Mã đã đạt giới hạn sử dụng" });
        res.json({ message: "Mã hợp lệ", data: promo });
    }
    catch (error) {
        res.status(500).json({ message: "Lỗi khi kiểm tra mã", error });
    }
});
exports.checkPromotionCode = checkPromotionCode;
// 🧮 Tăng số lượt sử dụng (gọi khi user thanh toán xong)
const increasePromotionUsage = (maCode) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const promo = yield promotion_model_1.default.findOne({ maCode: maCode.toUpperCase() });
        if (!promo)
            return;
        promo.daSuDung = ((_a = promo.daSuDung) !== null && _a !== void 0 ? _a : 0) + 1;
        if (promo.gioiHanSuDung && promo.daSuDung >= promo.gioiHanSuDung) {
            promo.trangThai = "expired";
        }
        yield promo.save();
    }
    catch (error) {
        console.error("❌ Lỗi cập nhật lượt dùng:", error);
    }
});
exports.increasePromotionUsage = increasePromotionUsage;
