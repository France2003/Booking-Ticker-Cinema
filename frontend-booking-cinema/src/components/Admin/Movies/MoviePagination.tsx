import React from "react";

interface MoviePaginationProps {
    currentPage: number;
    total: number;
    limit: number;
    onPageChange: (page: number) => void;
}

const MoviePagination: React.FC<MoviePaginationProps> = ({
    currentPage,
    total,
    limit,
    onPageChange,
}) => {
    const totalPages = Math.ceil(total / limit);
    if (totalPages <= 1) return null;

    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

    return (
        <div className="flex justify-center items-center mt-6 gap-2">
            <button
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className={`px-3 py-1 border rounded ${currentPage === 1
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-white hover:bg-blue-50"
                    }`}
            >
                ← Trước
            </button>

            {pages.map((p) => (
                <button
                    key={p}
                    onClick={() => onPageChange(p)}
                    className={`px-3 py-1 border rounded ${p === currentPage
                            ? "bg-indigo-600 text-white border-indigo-600"
                            : "bg-white hover:bg-blue-50"
                        }`}
                >
                    {p}
                </button>
            ))}

            <button
                onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className={`px-3 py-1 border rounded ${currentPage === totalPages
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-white hover:bg-blue-50"
                    }`}
            >
                Sau →
            </button>
        </div>
    );
};

export default MoviePagination;
