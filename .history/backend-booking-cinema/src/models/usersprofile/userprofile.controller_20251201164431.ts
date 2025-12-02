import { Response } from "express";
import { UserModel } from "../../models/user/userManager.model";
import { AuthRequest } from "../../middlewares/auth.middleware";
import { Booking } from "../bookings/booking.model";
// 📌 Lấy thông tin profile
export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    const user = await UserModel.findById(userId).select("-password");
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json(user);
  } catch (err: any) {
    console.error("❌ getProfile error:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
// 📌 Cập nhật profile
export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      console.warn("⚠️ Không có userId trong token!");
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    const { fullname, phone, dateofbirth, gender, address } = req.body;
    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      {
        $set: { fullname, phone, dateofbirth, gender, address },
      },
      { new: true, runValidators: true }
    ).select("-password");
    if (!updatedUser) {
      console.warn("❌ Không tìm thấy user với id:", userId);
      res.status(404).json({ message: "User not found" });
      return;
    }
    res.json({
      message: "Cập nhật thông tin thành công",
      user: updatedUser,
    });
  } catch (err: any) {
    console.error("🔥 [updateProfile] Lỗi server:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
export const getMyBookings = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    const bookings = await Booking.find({ userId })
      .populate("movieId")
      .populate("roomId")
      .populate("showtimeId")
      .sort({ createdAt: -1 });

    res.json(bookings);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

