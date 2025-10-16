import { Request, Response } from "express";
import { UserModel } from "../../models/user/userManager.model";
export const getAllUsers = async (req: Request, res: Response) => {
    const users = await UserModel.find({ role: "user" }).select("-password");
    res.json(users);
};
export const getUserById = async (req: Request, res: Response): Promise<void> => {
    const user = await UserModel.findById(req.params.id).select("-password");
    if (!user) {
        res.status(404).json({ message: "Không tìm thấy người dùng" })
        return;
    }
    res.json(user);
};
export const toggleUserStatus = async (req: Request, res: Response): Promise<void> => {
    try {
        const user = await UserModel.findById(req.params.id);
        if (!user) {
            res.status(404).json({ message: "Không tìm thấy người dùng" });
            return;
        }
        user.trangThai = !user.trangThai;
        await user.save();
        res.status(200).json({
            message: `Tài khoản đã được ${user.trangThai ? "mở khóa" : "khóa"}`,
            user: user
        });
    } catch (error) {
        console.error("Error toggling user status:", error);
        res.status(500).json({ message: "Lỗi máy chủ nội bộ" });
    }
};
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
    await UserModel.findByIdAndDelete(req.params.id);
    res.json({ message: "Xóa người dùng thành công" });
};
