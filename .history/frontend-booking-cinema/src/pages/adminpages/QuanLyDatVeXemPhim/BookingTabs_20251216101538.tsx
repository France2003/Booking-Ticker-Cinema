import { useState } from "react";
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
    const [activeTab, setActiveTab] = useState<"today" | "upcoming" | "past">("today");

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
        if (dates.length === 0)
            return <p className="text-gray-400 italic mb-6">Không có vé nào.</p>;

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
                    { key: "today", label: `📅 Hôm nay (${categorized.today.length})` },
                    { key: "upcoming", label: `🎞️ Sắp tới (${categorized.upcoming.length})` },
                    { key: "past", label: `🕰️ Đã chiếu (${categorized.past.length})` },
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
                {activeTab === "today" && renderGrouped(categorized.today)}
                {activeTab === "upcoming" && renderGrouped(categorized.upcoming)}
                {activeTab === "past" && renderGrouped(categorized.past)}
            </div>
        </div>
    );
};

export default BookingTabs;
