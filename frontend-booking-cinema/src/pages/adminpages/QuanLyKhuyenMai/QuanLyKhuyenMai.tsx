import { useEffect, useState } from "react"
import AdminLayout from "../../../layouts/adminlayout/adminlayout"
import {
  getPromotions,
  createPromotion,
  updatePromotion,
  deletePromotion,
} from "../../../services/promotions/promotions"
import type { Promotion } from "../../../types/promotions/promotion.type"
import { toast } from "react-toastify"
import PromotionFormModal from "./PromotionFormModal"
import PromotionDetailModal from "./PromotionDetailModal"

const QuanLyKhuyenMai = () => {
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [editData, setEditData] = useState<Promotion | null>(null)
  const [viewData, setViewData] = useState<Promotion | null>(null)
  const [formData, setFormData] = useState<Promotion>({
    tenKhuyenMai: "",
    maCode: "",
    loai: "percent",
    giaTri: 0,
    moTa: "",
    noiDungChiTiet: "",
    ngayBatDau: "",
    ngayKetThuc: "",
    dieuKhoan: "",
    luuY: "",
    gioiHanSuDung: 0,
    daSuDung: 0,
    trangThai: "upcoming",
    anhDaiDien: "",
  })
  // 🔹 Lấy danh sách khuyến mãi
  const fetchData = async () => {
    try {
      const res = await getPromotions()
      setPromotions(res.data)
    } catch {
      toast.error("Không thể tải danh sách khuyến mãi!")
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    fetchData()
  }, [])
  // 🔹 Xử lý thay đổi input
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === "giaTri" || name === "gioiHanSuDung" || name === "daSuDung" ? Number(value) : value,
    }))
  }
  // 🔹 Gửi form thêm / sửa
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editData) {
        await updatePromotion(formData, editData._id!)
        toast.success("Cập nhật thành công!")
      } else {
        await createPromotion(formData)
        toast.success("Tạo khuyến mãi mới thành công!")
      }
      setIsModalOpen(false)
      setEditData(null)
      fetchData()
    } catch {
      toast.error("Lỗi khi lưu khuyến mãi!")
    }
  }
  // 🔹 Xoá khuyến mãi
  const handleDelete = async (id: string) => {
    if (!window.confirm("Bạn có chắc muốn xoá khuyến mãi này?")) return
    try {
      await deletePromotion(id)
      toast.success("Đã xoá khuyến mãi")
      fetchData()
    } catch {
      toast.error("Không thể xoá khuyến mãi")
    }
  }
  // 🔹 Mở form sửa
  const openEditModal = (promo: Promotion) => {
    setEditData(promo)
    setFormData({
      ...promo,
      ngayBatDau: promo.ngayBatDau.toString().slice(0, 10),
      ngayKetThuc: promo.ngayKetThuc.toString().slice(0, 10),
    })
    setIsModalOpen(true)
  }
  const openCreateModal = () => {
    setEditData(null)
    setFormData({
      tenKhuyenMai: "",
      maCode: "",
      loai: "percent",
      giaTri: 0,
      moTa: "",
      noiDungChiTiet: "",
      ngayBatDau: "",
      ngayKetThuc: "",
      dieuKhoan: "",
      luuY: "",
      gioiHanSuDung: 0,
      daSuDung: 0,
      trangThai: "upcoming",
      anhDaiDien: "",
    })
    setIsModalOpen(true)
  }
  // 🔹 Mở xem chi tiết
  const openViewModal = (promo: Promotion) => {
    setViewData(promo)
    setIsViewModalOpen(true)
  }
  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-semibold text-gray-800">🎟️ Quản lý Khuyến Mãi</h2>
        <button
          onClick={openCreateModal}
          className="bg-gradient-to-r from-blue-500 to-blue-700 text-white px-5 py-2 rounded-lg shadow-md hover:scale-105 transform transition">
          + Thêm khuyến mãi
        </button>
      </div>
      {/* Danh sách khuyến mãi */}
      {loading ? (
        <p className="text-center text-gray-500">Đang tải...</p>
      ) : (
        <div className="overflow-hidden bg-white rounded-xl shadow-lg">
          <table className="min-w-full text-sm">
            <thead className="bg-gradient-to-r from-gray-100 to-gray-50 text-gray-800">
              <tr>
                <th className="px-4 py-3 text-left">Ảnh</th>
                <th className="px-4 py-3 text-left">Tên khuyến mãi</th>
                <th className="px-4 py-3 text-left">Mã code</th>
                <th className="px-4 py-3 text-center">Loại</th>
                <th className="px-4 py-3 text-center">Giá trị</th>
                <th className="px-4 py-3 text-center">Trạng thái</th>
                <th className="px-4 py-3 text-center">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {promotions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-6 text-gray-500">
                    Không có khuyến mãi nào.
                  </td>
                </tr>
              ) : (
                promotions.map((p, i) => (
                  <tr key={p._id} className={`hover:bg-gray-50 transition ${i % 2 === 0 ? "bg-white" : "bg-gray-50/40"}`}>
                    <td className="px-4 py-3">
                      <img
                        src={p.anhDaiDien || "/no-image.png"}
                        alt={p.tenKhuyenMai}
                        className="w-16 h-16 object-cover rounded-md shadow-sm border"
                      />
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-800">{p.tenKhuyenMai}</td>
                    <td className="px-4 py-3 font-mono text-gray-600">{p.maCode}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 text-xs rounded-md ${p.loai === "percent" ? "bg-blue-100 text-blue-700" : p.loai === "fixed"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-purple-100 text-purple-700"}`} >
                        {p.loai}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-gray-700">
                      {p.loai === "percent"
                        ? `${p.giaTri}%`
                        : `${p.giaTri.toLocaleString()}${p.loai === "fixed" ? "đ" : ""}`}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${p.trangThai === "active"
                          ? "bg-green-100 text-green-700"
                          : p.trangThai === "expired"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                          }`}
                      >
                        {p.trangThai}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center space-x-2">
                      <button onClick={() => openViewModal(p)} className="text-indigo-600 hover:underline font-medium">
                        Xem
                      </button>
                      <button onClick={() => openEditModal(p)} className="text-blue-600 hover:underline font-medium">
                        Sửa
                      </button>
                      <button onClick={() => handleDelete(p._id!)} className="text-red-600 hover:underline font-medium">
                        Xoá
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
      {/* Modal thêm/sửa */}
      <PromotionFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        formData={formData}
        setFormData={setFormData}
        editData={editData}
        handleChange={handleChange}
      />
      {/* Modal xem chi tiết */}
      <PromotionDetailModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        viewData={viewData}
      />
    </AdminLayout>
  )
}

export default QuanLyKhuyenMai
