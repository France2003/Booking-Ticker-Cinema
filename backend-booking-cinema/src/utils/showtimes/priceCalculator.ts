// 💰 Giá cơ bản theo loại phòng
export const BASE_PRICE = {
  standard: 80000,
  "2D": 80000,
  "3D": 100000,
  "IMAX": 120000,
};

export const getDynamicPrice = (base: number, hour: number, isHot: boolean, weekday?: number): number => {
  let price = base;
  // 🌅 Buổi sáng (trước 11h) → giảm 20%
  if (hour < 11) price *= 0.8;

  // 🌆 Giờ bình thường (11h–17h) → giữ nguyên
  else if (hour >= 11 && hour < 17) price *= 1.0;

  // 🌇 Giờ cao điểm (17h–22h) → tăng nhẹ 15%
  else if (hour >= 17 && hour <= 22) price *= 1.15;

  // 🌙 Sau 22h → giảm mạnh 25%
  else if (hour > 22) price *= 0.75;

  // 🔥 Phim hot → tăng nhẹ 10%
  if (isHot && hour >= 12 && hour <= 22) price *= 1.1;

  // 📅 Ưu đãi theo ngày trong tuần
  if (weekday !== undefined) {
    // T2–T5: giảm 15%
    if (weekday >= 1 && weekday <= 4) price *= 0.85;
    // T6–CN: tăng nhẹ 10%
    else if (weekday === 5 || weekday === 6 || weekday === 0) price *= 1.1;
  }

  // Làm tròn nghìn
  return Math.round(price / 1000) * 1000;
};
