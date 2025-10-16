import { Link } from "react-router-dom";
import { useUser } from "../../contexts/UserContext";
import { useState } from "react";
const Navbar = () => {
    const { user, logout } = useUser();
    const [open, setOpen] = useState(false);
    return (
        <header className="bg-white shadow p-4 flex justify-between items-center">
            <h1 className="text-lg font-bold">Bảng điều khiển</h1>
            <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">Admin</span>
                <img
                    src="https://i.pravatar.cc/40"
                    alt="avatar"
                    className="w-8 h-8 rounded-full"
                />
                <button
                    onClick={() => {
                        logout();
                        setOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                >
                    <Link to="/login">Đăng xuất</Link>
                </button>
            </div>
        </header>
    );
};

export default Navbar;
