import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import NavItem from "./NavItem";
import LogoMetiz from "./Logo";
import Avatar from "./Avatar";
import { useUser } from "../../contexts/UserContext";
import NotificationBell from "../../components/Admin/NotificationBell";
const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useUser(); // lấy user từ context

  return (
    <header className="text-white fixed top-0 left-0 w-full z-50 shadow-lg">
      {/* Thanh trên: hotline */}
      <div className="bg-[#0F1D2F]">
        <div className="container mx-auto flex justify-end py-2 px-4 text-sm">
          <span className="mr-6">HOTLINE: 0363977687</span>
          <span className="uppercase">GIỜ MỞ CỬA: 7:30 - 24:00</span>
        </div>
      </div>
      <div className="bg-[#031327]">
        <div className="container mx-auto flex items-center justify-between px-4 md:px-8 py-3 font-semibold">
          {/* Logo trái */}
          <Link to="/" className="flex-shrink-0 px-4 md:px-8 lg:px-16">
            <LogoMetiz />
          </Link>
          <ul className="hidden md:flex gap-8 uppercase text-[16px] tracking-wide flex-1 justify-center">
            <NavItem label="Lịch chiếu" href="/lich-chieu" />
            <NavItem
              label="Phim"
              submenu={[
                { label: "Phim đang công chiếu", href: "/phim-dang-chieu" },
                { label: "Phim sắp công chiếu", href: "/phim-sap-cong-chieu" },
              ]}
            />
            <NavItem label="Ưu đãi" href="/promotions" />
            <NavItem label="Liên hệ" href="/contact" />
            <NavItem
              label="Thành viên"
              submenu={[
                { label: "Tài khoản Metiz", href: "/thanh-vien/tai-khoan" },
                { label: "Quyền lợi", href: "/thanh-vien/quyen-loi" },
              ]}
            />
          </ul>
          <div className="hidden md:flex items-center px-4 md:px-8 lg:px-16">
            {user ? (
              <>
                <NotificationBell userId={user._id} />
                <Avatar />
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm hover:text-gray-300">
                  Đăng nhập
                </Link>
                <span className="mx-1">/</span>
                <Link to="/register" className="text-sm hover:text-gray-300">
                  Đăng ký
                </Link>
              </>
            )}
          </div>
          <button
            className="md:hidden text-white ml-auto"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>
      {mobileOpen && (
        <div className="md:hidden bg-[#03101f] px-4 py-4">
          <ul className="flex flex-col gap-4 uppercase">
            <li className="text-gray-400 hover:text-white">
              {user ? (
                <>
                  <span className="px-3 py-2 text-white">Xin chào, {user.fullname}</span>
                  <button
                    onClick={logout}
                    className="block mt-2 px-3 py-2 font-semibold transition-colors duration-200 text-gray-300 hover:text-white "
                  >
                    <NavItem label="Đăng xuất" href="/login" />
                  </button>
                </>
              ) : (
                <>
                  <NavItem label="Đăng nhập" href="/login" />/{" "}
                  <NavItem label="Đăng ký" href="/register" />
                </>
              )}
            </li>
            <NavItem label="Lịch chiếu" href="/lich-chieu" />
            <NavItem
              label="Phim"
              submenu={[
                { label: "Phim đang công chiếu", href: "/phim-dang-chieu" },
                { label: "Phim sắp công chiếu", href: "/phim-sap-cong-chieu" },
              ]}
            />
            <NavItem label="Ưu đãi" href="/promotions" />
            <NavItem label="Liên hệ" href="/contact" />
            <NavItem
              label="Thành viên"
              submenu={[
                { label: "Tài khoản Metiz", href: "/thanh-vien/tai-khoan" },
                { label: "Quyền lợi", href: "/thanh-vien/quyen-loi" },
              ]}
            />
          </ul>
        </div>
      )}
    </header>
  );
};

export default Header;
