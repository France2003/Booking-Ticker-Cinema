import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
export const validateRequest = (req: Request, res: Response, next: NextFunction): void => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({
            message: "Dữ liệu không hợp lệ",
            errors: errors.array()
        });
        return;
    }
    next();
};
