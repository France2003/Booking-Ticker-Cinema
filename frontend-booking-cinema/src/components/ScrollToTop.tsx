import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
    const { pathname } = useLocation();

    useEffect(() => {
        // Khi đường dẫn thay đổi, cuộn lên đầu trang
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, [pathname]);

    return null; // Component không render gì ra màn hình
}
