"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTimeSlotsForDay = void 0;
const getTimeSlotsForDay = (weekday) => {
    switch (weekday) {
        case 0: // Chủ nhật
            return [
                "08:45", "11:00", "13:15",
                "15:30", "17:45", "20:00",
                "22:15", "00:15"
            ];
        case 6: // Thứ 7
            return [
                "08:30", "10:45", "13:00",
                "15:15", "17:30", "19:45",
                "22:00", "00:10"
            ];
        case 5: // Thứ 6
            return [
                "09:00", "11:15", "13:30",
                "15:45", "18:00", "20:15",
                "22:30", "00:00"
            ];
        default: // Thứ 2 – Thứ 5
            return [
                "09:00", "11:15", "13:30",
                "15:45", "18:00", "20:15",
                "22:30"
            ];
    }
};
exports.getTimeSlotsForDay = getTimeSlotsForDay;
