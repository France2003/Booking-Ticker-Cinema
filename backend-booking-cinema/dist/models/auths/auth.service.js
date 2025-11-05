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
exports.login = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const auth_model_1 = require("./auth.model");
const jwt_1 = require("../../utils/jwt");
const register = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const { fullname, email, phone, password, dateofbirth } = data;
    const existing = yield auth_model_1.UserModel.findOne({ $or: [{ email }, { phone }] });
    if (existing) {
        throw new Error("Email hoặc số điện thoại đã tồn tại");
    }
    const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
    const user = new auth_model_1.UserModel({
        fullname,
        email,
        phone,
        password: hashedPassword,
        dateofbirth,
        role: "user",
    });
    yield user.save();
    return user;
});
exports.register = register;
const login = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = data;
    const user = yield auth_model_1.UserModel.findOne({ email });
    if (!user) {
        throw new Error("Thông tin đăng nhập không hợp lệ");
    }
    if (!user.trangThai) {
        throw new Error("Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.");
    }
    const isMatch = yield bcryptjs_1.default.compare(password, user.password);
    if (!isMatch) {
        throw new Error("Thông tin đăng nhập không hợp lệ");
    }
    const payload = {
        id: user._id.toString(),
        role: user.role,
    };
    const token = (0, jwt_1.generateToken)(payload);
    const refreshToken = (0, jwt_1.generateRefreshToken)(payload);
    return {
        token,
        refreshToken,
        user: {
            _id: user._id.toString(),
            fullname: user.fullname,
            role: user.role,
            email: user.email,
            phone: user.phone,
            trangThai: user.trangThai,
        },
    };
});
exports.login = login;
