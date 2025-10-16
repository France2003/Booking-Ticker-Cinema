import bcrypt from "bcryptjs";
import { UserModel } from "./auth.model";
import { RegisterDTO, LoginDTO, TokenPayload, IUser } from "../auths/auth.types";
import { generateRefreshToken, generateToken } from "../../utils/jwt";
export const register = async (data: RegisterDTO): Promise<IUser> => {
  const { fullname, email, phone, password, dateofbirth } = data;
  const existing = await UserModel.findOne({ $or: [{ email }, { phone }] });
  if (existing) {
    throw new Error("Email hoặc số điện thoại đã tồn tại");
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new UserModel({
    fullname,
    email,
    phone,
    password: hashedPassword,
    dateofbirth,
    role: "user",
  });

  await user.save();
  return user;
};
export const login = async (
  data: LoginDTO
): Promise<{
  token: string;
  refreshToken: string;
  user: {
    _id: string;
    fullname: string;
    role: string;
    email: string;
    phone?: string;
    trangThai?: boolean;
  };
}> => {
  const { email, password } = data;

  const user = await UserModel.findOne({ email });
  if (!user) {
    throw new Error("Thông tin đăng nhập không hợp lệ");
  }
  if (!user.trangThai) {
  throw new Error("Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.");
}
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("Thông tin đăng nhập không hợp lệ");
  }

  const payload: TokenPayload = {
    id: user._id.toString(),
    role: user.role,
  };

  const token = generateToken(payload);
  const refreshToken = generateRefreshToken(payload);
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
};

