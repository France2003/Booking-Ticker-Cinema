import { Star } from "lucide-react";

interface RatingStarsProps {
    value: number; // Giá trị sao hiện tại (vd: 4.5)
    editable?: boolean; // Cho phép chỉnh
    onChange?: (value: number) => void;
    size?: number; // kích thước icon
}

export default function RatingStars({
    value = 0,
    editable = false,
    onChange,
    size = 20,
}: RatingStarsProps) {
    // 🔢 Làm tròn: ví dụ 3.4 -> 3, 3.6 -> 4
    const roundedValue = Math.round(value * 2) / 2; // có thể có .5

    const stars = [1, 2, 3, 4, 5];

    const handleClick = (starValue: number) => {
        if (!editable || !onChange) return;
        onChange(starValue);
    };

    return (
        <div className="flex items-center">
            {stars.map((star) => {
                const isFull = star <= Math.floor(roundedValue);
                const isHalf = !isFull && star - 0.5 === roundedValue;

                return (
                    <div
                        key={star}
                        className={`relative cursor-${editable ? "pointer" : "default"}`}
                        onClick={() => handleClick(star)}
                    >
                        {/* ⭐ Nửa sao */}
                        {isHalf ? (
                            <div className="relative">
                                <Star
                                    size={size}
                                    className="text-gray-300 fill-gray-300"
                                />
                                <div className="absolute top-0 left-0 overflow-hidden w-1/2">
                                    <Star
                                        size={size}
                                        className="text-yellow-400 fill-yellow-400"
                                    />
                                </div>
                            </div>
                        ) : (
                            <Star
                                size={size}
                                className={`${isFull
                                        ? "text-yellow-400 fill-yellow-400"
                                        : "text-gray-300 fill-gray-300"
                                    } transition`}
                            />
                        )}
                    </div>
                );
            })}
        </div>
    );
}
