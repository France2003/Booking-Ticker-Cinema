import mongoose, { Schema, Document } from "mongoose"
import { IPromotion } from "./promotion.types"

export interface IPromotionDocument extends IPromotion, Document { }

const PromotionSchema = new Schema<IPromotionDocument>(
    {
        tenKhuyenMai: { type: String, required: true },
        maCode: { type: String, unique: true, uppercase: true, trim: true },
        loai: { type: String, enum: ["percent", "fixed", "voucher", "event"], required: true },
        giaTri: { type: Number },
        moTa: { type: String },
        anhDaiDien: { type: String },
        noiDungChiTiet: { type: String },
        ngayBatDau: { type: Date, required: true },
        ngayKetThuc: { type: Date, required: true },
        dieuKhoan: { type: String },
        luuY: { type: String },
        gioiHanSuDung: { type: Number, default: 0 },
        daSuDung: { type: Number, default: 0 },
        trangThai: {
            type: String,
            enum: ["active", "expired", "upcoming"],
            default: "upcoming",
        },
        taoBoi: { type: String },
    },
    { timestamps: { createdAt: "ngayTao", updatedAt: "ngayCapNhat" } }
)

// ✅ Tự động cập nhật trạng thái khi lưu
PromotionSchema.pre("save", function (next) {
    const now = new Date()
    if (this.ngayBatDau > now) this.trangThai = "upcoming"
    else if (this.ngayKetThuc < now) this.trangThai = "expired"
    else this.trangThai = "active"
    next()
})

export default mongoose.model<IPromotionDocument>("Promotion", PromotionSchema)
