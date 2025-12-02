import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

export default function PageLoader() {
    const { pathname } = useLocation();
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        setLoading(true);
        const timer = setTimeout(() => setLoading(false), 1000);
        return () => clearTimeout(timer);
    }, [pathname]);

    if (!loading) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center 
            bg-black/20 backdrop-blur-md">
            <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-3 text-gray-100 font-medium drop-shadow">
                Đang tải trang...
            </p>
        </div>
    );
}
