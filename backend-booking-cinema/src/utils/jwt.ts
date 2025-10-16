import jwt from "jsonwebtoken";
import { ENV } from "../config/env";
import { TokenPayload } from "../models/auths/auth.types";
export const generateToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, ENV.JWT_SECRET as string, { expiresIn: "150d" });
};
export const generateRefreshToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, ENV.JWT_SECRET as string, { expiresIn: "150d" });
};
export const verifyToken = (token: string): TokenPayload => {
  return jwt.verify(token, ENV.JWT_SECRET as string) as TokenPayload;
};

