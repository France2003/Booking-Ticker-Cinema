import React, { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import type { UserProfile, UpdateProfileData } from "../../../types/userProfile/useProfile";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import InputField from "../../../components/InputField";

interface ProfileFormProps {
    profile: UserProfile;
    onUpdate: (data: UpdateProfileData) => Promise<void>;
}

const ProfileForm: React.FC<ProfileFormProps> = ({ profile, onUpdate }) => {
    const [form, setForm] = useState<UpdateProfileData>(profile);
    const [saving, setSaving] = useState(false);
    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
    };
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await onUpdate(form);
            toast.success("Cập nhật thông tin thành công!", { autoClose: 3000 });
        } catch (err) {
            console.error("Update profile error:", err);
            toast.error("Cập nhật thất bại!", { autoClose: 3000 });
        } finally {
            setSaving(false);
        }
    };
    return (
        <form
            onSubmit={handleSubmit}
            className="bg-white shadow-md rounded-2xl p-8 space-y-6 border border-gray-100"
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField
                    label="Họ và tên"
                    name="fullname"
                    value={form.fullname || ""}
                    onChange={handleChange}
                    placeholder="Nhập họ tên"
                />
                <InputField
                    label="Email"
                    name="email"
                    value={form.email || ""}
                    readOnly
                    disabled
                />
                <InputField
                    label="Số điện thoại"
                    name="phone"
                    value={form.phone || ""}
                    onChange={handleChange}
                    placeholder="Nhập số điện thoại"
                />
                <InputField
                    label="Ngày sinh"
                    name="dateofbirth"
                    type="date"
                    value={form.dateofbirth ? form.dateofbirth.split("T")[0] : ""}
                    onChange={handleChange}
                />
                <div>
                    <label className="block text-gray-700 font-semibold mb-1">Giới tính</label>
                    <select
                        name="gender"
                        value={form.gender || ""}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Chọn giới tính</option>
                        <option value="Nam">Nam</option>
                        <option value="Nữ">Nữ</option>
                        <option value="Khác">Khác</option>
                    </select>
                </div>
                <InputField
                    label="Địa chỉ"
                    name="address"
                    value={form.address || ""}
                    onChange={handleChange}
                    placeholder="Nhập địa chỉ"
                />
            </div>

            <div className="pt-4">
                <button
                    type="submit"
                    disabled={saving}
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-700 text-white font-semibold py-3 rounded-lg hover:opacity-90 transition disabled:opacity-50"
                >
                    {saving ? "Đang lưu..." : "Cập nhật thông tin"}
                </button>
            </div>
        </form>
    );
};
export default ProfileForm;
