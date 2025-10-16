import AdminLayout from "../../../layouts/adminlayout/adminlayout";
import StatCard from "../../../components/Admin/Dashboard.StatCard";
import { Users, ShoppingCart, DollarSign } from "lucide-react";
const DashboardHome = () => {
  return (
    <AdminLayout>
      <div className="bg-white p-6 rounded-2xl shadow mb-6">
        <h2 className="text-xl font-semibold mb-2">Doanh thu</h2>
        <p className="text-3xl font-bold text-indigo-600">$613,200</p>
        <p className="text-gray-500">Tháng 1 - Tháng 7 năm 2023</p>
        <div className="h-40 bg-gradient-to-r from-indigo-100 to-indigo-200 rounded-lg mt-4"></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Người dùng" value="44,725" change="-12,4%" icon={<Users />} />
        <StatCard title="Đơn hàng" value="385" change="+17,2%" positive icon={<ShoppingCart />} />
        <StatCard title="Doanh thu" value="$613,200" change="+5,1%" positive icon={<DollarSign />} />
      </div>
    </AdminLayout>
  );
};
export default DashboardHome;
