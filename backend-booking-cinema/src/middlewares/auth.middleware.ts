import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";
export interface AuthRequest extends Request {
  user?: { id: string; role: string; fullname?: string; email?:string };
}
export const requireAuth = (req: AuthRequest, res: Response, next: NextFunction):void => {
  const header = req.headers["authorization"];
  if (!header || !header.startsWith("Bearer ")) {
    res.status(403).json({ message: "No token provided" });
    return 
  }

  const token = header.split(" ")[1];
  try {
    const decoded = verifyToken(token) as { id: string; role: string };
    req.user = decoded;
    next();
  } catch (err) {
    console.error("Invalid token:", err);
    res.status(401).json({ message: "Invalid or expired token" });
    return 
  }
};

export const isAdmin = (req: AuthRequest, res: Response, next: NextFunction):void => {
  if (req.user?.role !== "admin") {
    res.status(403).json({ message: "Admins only" });
    return 
  }
  next();
};
