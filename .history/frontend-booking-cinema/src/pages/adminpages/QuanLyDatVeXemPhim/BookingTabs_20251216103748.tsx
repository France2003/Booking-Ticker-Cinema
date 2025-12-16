import { useState, useMemo } from "react";
import dayjs from "dayjs";
import BookingTable from "./BookingTable";
import type { IBooking } from "../../../types/bookings/booking";

interface Props {
    categorized: {
        today: IBooking[];
        upcoming: IBooking[];
        past: IBooking[];
    };
    handleApprove: (code: string) => void;
    handleReject: (code: string) => void;
}

const BookingTabs = ({ categorized, handleApprove, handleReject }: Props) => {
    const [activeTab, setActiveTab] =
        useState<"today" | "upcoming" | "past">("today");

    /**
     * ✅ PHÂN LOẠI LẠI THEO endTime (NGHIỆP VỤ ĐÚNG)
     */
    const fixedCategorized = useMemo(() => {
        const allBookings: IBooking[] = [
            ...categorized.today,
            ...categorized.upcoming,
            ...categorized.past,
        ];

        const now = dayjs();

        const today: IBooking[] = [];
        const upcoming: IBooking[] = [];
        const past: IBooking[] = [];

        allBookings.forEach((b) => {
            const endTime = b.showtimeId?.endTime;
            if (!endTime) return;

            const end = dayjs(endTime);

            if (now.isAfter(end)) {
                past.push(b);               // ❌ đã chiếu
            } else if (now.isSame(end, "day")) {
                today.push(b);              // ✅ hôm nay (chưa chiếu xong)
            } else {
                upcoming.push(b);           // 🎞️ sắp tới
            }
        });

        return { today, upcoming, past };
    }, [categorized]);

    /**
     * Group theo NGÀY CHIẾU (CHỈ DÙNG ĐỂ HIỂN THỊ)
     */
    const groupByDate = (bookings: IBooking[]) => {
        const grouped: Record<string, IBooking[]> = {};
        bookings.forEach((b) => {
            const date = dayjs(b.showtimeId?.date).format("YYYY-MM-DD");
            if (!grouped[date]) grouped[date] = [];
            grouped[date].push(b);
        });
        return grouped;
    };

    const renderGrouped = (bookings: IBooking[]) => {
        const grouped = groupByDate(bookings);
        const dates = Object.keys(grouped).sort();

        if (dates.length === 0) {
            return <p className="text-gray-400 italic mb-6">Không có vé nào.</p>;
        }

        return dates.map((date) => (
            <div key={date} className="mb-8">
                <h3 className="text-lg uppercase font-bold text-pink-600 mb-2">
                    📆 {dayjs(date).format("dddd, DD/MM/YYYY")}
                    <span className="ml-2 uppercase text-gray-500 text-sm">
                        ({grouped[date].length} vé)
                    </span>
                </h3>

                <BookingTable
                    bookings={grouped[date]}
                    handleApprove={handleApprove}
                    handleReject={handleReject}
                />
            </div>
        ));
    };

    return (
        <div>
            {/* Tabs Header */}
            <div className="flex gap-4 border-b mb-6">
                {[
                    { key: "today", label: `📅 Hôm nay (${fixedCategorized.today.length})` },
                    { key: "upcoming", label: `🎞️ Sắp tới (${fixedCategorized.upcoming.length})` },
                    { key: "past", label: `🕰️ Đã chiếu (${fixedCategorized.past.length})` },
                ].map(({ key, label }) => (
                    <button
                        key={key}
                        onClick={() => setActiveTab(key as any)}
                        className={`pb-2 font-semibold border-b-2 transition-all ${activeTab === key
                                ? "border-pink-600 text-pink-600"
                                : "border-transparent text-gray-500 hover:text-pink-500"
                            }`}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {/* Nội dung tab */}
            <div className="animate-fadeIn">
                {activeTab === "today" && renderGrouped(fixedCategorized.today)}
                {activeTab === "upcoming" && renderGrouped(fixedCategorized.upcoming)}
                {activeTab === "past" && renderGrouped(fixedCategorized.past)}
            </div>
        </div>
    );
};

export default BookingTabs;
