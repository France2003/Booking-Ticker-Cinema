import React from "react";
interface ShowtimePaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}
const ShowtimePagination: React.FC<ShowtimePaginationProps> = ({
    currentPage,
    totalPages,
    onPageChange,
}) => {
    if (totalPages <= 1) return null;
    return (
        <div className="flex justify-center items-center gap-3 mt-4">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 border rounded disabled:opacity-50"> ← Trước
            </button>
            <span>
                Trang {currentPage}/{totalPages}
            </span>
            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border rounded disabled:opacity-50"> Sau →
            </button>
        </div>
    );
};

export default ShowtimePagination;
