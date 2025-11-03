import { Request, Response } from "express"
import Promotion from "./promotion.model"

// 🟢 Thêm khuyến mãi
export const createPromotion = async (req: Request, res: Response): Promise<void> => {
    try {
        const anhDaiDien = req.file ? `/uploads/${req.file.filename}` : undefined

        const promo = new Promotion({
            ...req.body,
            anhDaiDien,
        })

        await promo.save()
        res.status(201).json({ message: "Tạo khuyến mãi thành công", data: promo })
    } catch (error) {
        res.status(400).json({ message: "Lỗi khi tạo khuyến mãi", error })
    }
}

// 🟡 Lấy danh sách khuyến mãi
export const getPromotions = async (_: Request, res: Response): Promise<void> => {
    try {
        const promotions = await Promotion.find().sort({ ngayTao: -1 })
        res.json({ data: promotions })
    } catch (error) {
        res.status(500).json({ message: "Lỗi khi lấy danh sách", error })
    }
}

// 🔵 Lấy chi tiết khuyến mãi theo ID
export const getPromotionById = async (req: Request, res: Response): Promise<void> => {
    try {
        const promo = await Promotion.findById(req.params.id)
        if (!promo) return void res.status(404).json({ message: "Không tìm thấy khuyến mãi" })
        res.json({ data: promo })
    } catch (error) {
        res.status(500).json({ message: "Lỗi khi lấy chi tiết", error })
    }
}

// 🟠 Cập nhật khuyến mãi
export const updatePromotion = async (req: Request, res: Response): Promise<void> => {
    try {
        const anhDaiDien = req.file ? `/uploads/${req.file.filename}` : undefined

        const promo = await Promotion.findByIdAndUpdate(
            req.params.id,
            { ...req.body, ...(anhDaiDien && { anhDaiDien }) },
            { new: true }
        )

        if (!promo) return void res.status(404).json({ message: "Không tìm thấy khuyến mãi" })
        res.json({ message: "Cập nhật thành công", data: promo })
    } catch (error) {
        res.status(400).json({ message: "Lỗi khi cập nhật", error })
    }
}

// 🔴 Xoá khuyến mãi
export const deletePromotion = async (req: Request, res: Response): Promise<void> => {
    try {
        const promo = await Promotion.findByIdAndDelete(req.params.id)
        if (!promo) return void res.status(404).json({ message: "Không tìm thấy khuyến mãi" })
        res.json({ message: "Đã xoá khuyến mãi" })
    } catch (error) {
        res.status(500).json({ message: "Lỗi khi xoá", error })
    }
}

// 🧩 Kiểm tra mã giảm giá hợp lệ
export const checkPromotionCode = async (req: Request, res: Response): Promise<void> => {
    try {
        const { maCode } = req.body
        const promo = await Promotion.findOne({ maCode: maCode?.toUpperCase() })
        if (!promo) return void res.status(404).json({ message: "Mã không tồn tại" })

        const now = new Date()
        if (promo.ngayBatDau > now)
            return void res.status(400).json({ message: "Khuyến mãi chưa bắt đầu" })
        if (promo.ngayKetThuc < now)
            return void res.status(400).json({ message: "Khuyến mãi đã hết hạn" })
        if (promo.gioiHanSuDung && (promo.daSuDung ?? 0) >= promo.gioiHanSuDung)
            return void res.status(400).json({ message: "Mã đã đạt giới hạn sử dụng" })

        res.json({ message: "Mã hợp lệ", data: promo })
    } catch (error) {
        res.status(500).json({ message: "Lỗi khi kiểm tra mã", error })
    }
}

// 🧮 Tăng số lượt sử dụng (gọi khi user thanh toán xong)
export const increasePromotionUsage = async (maCode: string) => {
    try {
        const promo = await Promotion.findOne({ maCode: maCode.toUpperCase() })
        if (!promo) return

        promo.daSuDung = (promo.daSuDung ?? 0) + 1

        if (promo.gioiHanSuDung && promo.daSuDung >= promo.gioiHanSuDung) {
            promo.trangThai = "expired"
        }

        await promo.save()
    } catch (error) {
        console.error("❌ Lỗi cập nhật lượt dùng:", error)
    }
}
