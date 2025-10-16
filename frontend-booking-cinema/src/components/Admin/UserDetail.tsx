import React from "react";
import type { User } from "../../types/userManager/userManage";
import { X, Calendar, Phone, Mail, MapPin, User as UserIcon, Transgender,LockOpen  } from "lucide-react";
import InfoRow from "../InfoRow";
interface UserDetailModalProps {
    user: User;
    onClose: () => void;
}
const UserDetailModal: React.FC<UserDetailModalProps> = ({ user, onClose }) => {
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl p-6 relative overflow-y-auto max-h-[90vh]">
                <button onClick={onClose} className="absolute top-3 right-3 text-gray-500 hover:text-red-500 transition">
                    <X size={22} />
                </button>
                <h2 className="text-2xl font-bold mb-6 text-center text-blue-600">
                    👤 Thông tin người dùng
                </h2>
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                    <InfoRow icon={<UserIcon size={18} />} label="Họ tên" value={user.fullname} />
                    <InfoRow icon={<Mail size={18} />} label="Email" value={user.email} />
                    <InfoRow icon={<Phone size={18} />} label="Số điện thoại" value={user.phone} />
                    <InfoRow icon={<Calendar size={18} />}
                        label="Ngày sinh"
                        value={
                            user.dateofbirth
                                ? new Date(user.dateofbirth).toLocaleDateString("vi-VN")
                                : "Chưa cập nhật"
                        }
                    />
                    <InfoRow icon={<Transgender size={18} />} label="Giới tính" value={user.gender || "Chưa cập nhật"} />
                    <InfoRow icon={<MapPin size={18} />} label="Địa chỉ" value={user.address || "Chưa cập nhật"} />
                    <InfoRow icon={<LockOpen size={18} />} label="Trạng thái" value={user.trangThai ? "Hoạt động" : "Bị khóa"} />
                </div>
                <Section title="🎟 Vé đang đặt">
                    <EmptyMessage text="Hiện chưa có vé đang đặt" />
                </Section>
                <Section title="🕓 Lịch sử đặt vé">
                    <EmptyMessage text="Hiện chưa có lịch sử đặt vé" />
                </Section>
            </div>
        </div>
    );
};
const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3 border-l-4 border-blue-600 pl-2">
            {title}
        </h3>
        {children}
    </div>
);

const EmptyMessage = ({ text }: { text: string }) => (
    <p className="text-gray-500 italic text-sm">{text}</p>
);

export default UserDetailModal;
