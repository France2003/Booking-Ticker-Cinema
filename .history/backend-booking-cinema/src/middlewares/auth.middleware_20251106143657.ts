import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";
import { UserModel } from "../models/auths/auth.model";
export interface AuthRequest extends Request {
  user?: { id: string; role: string; fullname?: string; email?: string };
}
export const requireAuth = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const header = req.headers["authorization"];
  if (!header || !header.startsWith("Bearer ")) {
    res.status(403).json({ message: "No token provided" });
    return
  }
  const token = header.split(" ")[1];
  try {
    const decoded = verifyToken(token) as { id: string; role: string };
    const user = await UserModel.findById(decoded.id).select("email fullname role");
    if (!user) {
      res.status(401).json({ message: "User not found" });
      return;
    }
    req.user = {
      id: user._id.toString(),
      role: user.role,
      fullname: user.fullname,
      email: user.email,
    };
    next();
  } catch (err) {
    console.error("Invalid token:", err);
    res.status(401).json({ message: "Invalid or expired token" });
    return
  }
};

export const isAdmin = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (req.user?.role !== "admin") {
    res.status(403).json({ message: "Admins only" });
    return
  }
  next();
};
