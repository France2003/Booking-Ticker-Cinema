// Giá cơ bản theo loại phòng
export const BASE_PRICE = {
  standard: 80000,
  "2D": 80000,
  "3D": 100000,
  "IMAX": 130000,
};

/**
 * Tính giá vé động theo giờ chiếu và mức độ hot của phim
 */
export const getDynamicPrice = (base: number, hour: number, isHot: boolean): number => {
  let price = base;

  // Buổi sáng (trước 11h) giảm 10%
  if (hour < 11) price *= 0.9;

  // Giờ cao điểm (17h – 22h) tăng 20%
  if (hour >= 17 && hour <= 22) price *= 1.2;

  // Phim hot tăng 30%
  if (isHot) price *= 1.3;

  // Làm tròn nghìn đồng
  return Math.round(price / 1000) * 1000;
};
