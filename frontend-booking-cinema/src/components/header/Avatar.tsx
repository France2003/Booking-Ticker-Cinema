import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useUser } from "../../contexts/UserContext";
const Avatar = () => {
  const { user, logout } = useUser();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 👉 Lấy chữ cái viết tắt
  const getInitials = (nameOrEmail: string) => {
    if (!nameOrEmail) return "?";
    const words = nameOrEmail.trim().split(" ");
    if (words.length > 1) {
      return words.map((w) => w[0].toUpperCase()).join("").slice(0, 3);
    }
    return nameOrEmail[0].toUpperCase();
  };

  const initials = getInitials(user?.fullname || user?.email || "");

  return (
    <div className="relative" ref={menuRef}>
      {/* Avatar button */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="h-10 w-10 rounded-full bg-yellow-500 flex items-center justify-center 
          text-white font-bold hover:scale-105 transition"
      >
        {user?.avatar ? (
          <img
            src={user.avatar}
            alt="avatar"
            className="h-10 w-10 rounded-full object-cover"
          />
        ) : (
          initials
        )}
      </button>

      {/* Dropdown menu */}
      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg 
          text-gray-700 z-50">
          {user ? (
            <>
              <div className="px-4 py-2 text-sm border-b border-gray-200">
                Xin chào,{" "}
                <span className="font-semibold">
                  {user.fullname || user.email}
                </span>
              </div>
              <Link
                to="/profile"
                className="block px-4 py-2 text-sm hover:bg-gray-100"
                onClick={() => setOpen(false)}
              >
                Hồ sơ cá nhân
              </Link>
              <button
                onClick={() => {
                  logout();
                  setOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
              >
                <Link to="/login">Đăng xuất</Link>
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="block px-4 py-2 text-sm hover:bg-gray-100"
                onClick={() => setOpen(false)}
              >
                Đăng nhập
              </Link>
              <Link
                to="/register"
                className="block px-4 py-2 text-sm hover:bg-gray-100"
                onClick={() => setOpen(false)}
              >
                Đăng ký
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Avatar;
