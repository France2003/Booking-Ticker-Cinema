import { Link, useLocation } from "react-router-dom";
const Sidebar = () => {
    const { pathname } = useLocation();
    const menus = [
        { path: "/dashboard", label: "Dashboard" },
        { path: "/quan-ly-phim", label: "Quản lý phim" },
        { path: "/quan-ly-dat-ve-xem-phim", label: "Quản lý đặt vé xem phim" },
        { path: "/quan-ly-xuat-chieu", label: "Quản lý xuất chiếu" },
        { path: "/quan-ly-phong-chieu", label: "Quản lý phòng chiếu" },
        { path: "/quan-ly-nguoi-dung", label: "Quản lý người dùng" },
        { path: "/quan-ly-khuyen-mai", label: "Quản lý khuyến mãi" },
        { path: "/quan-ly-binh-luan", label: "Quản lý bình luận" },
    ];
    return (
        <aside className="bg-white shadow-md w-64 min-h-screen p-4 hidden md:block">
            <h2 className="text-xl font-bold mb-6">🎬 Admin Dashboard</h2>
            <nav className="flex flex-col gap-3">
                {menus.map((menu) => (
                    <Link
                        key={menu.path}
                        to={menu.path}
                        className={`px-2 py-1 rounded hover:bg-indigo-50 ${pathname === menu.path ? "text-indigo-600 font-semibold" : "text-gray-700"}`} >
                        {menu.label}
                    </Link>
                ))}
            </nav>
        </aside>
    );
};
export default Sidebar;
