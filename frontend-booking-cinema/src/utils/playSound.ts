export const playSound = (type: "success" | "error") => {
    const soundMap = {
        success: "/src/assets/sounds/success.mp3",
        error: "/src/assets/sounds/error.mp3",
    };
    const audio = new Audio(soundMap[type]);
    audio.volume = 0.6; // giảm âm lượng một chút
    audio.play().catch(() => {
        console.warn("⚠️ Không thể phát âm thanh (có thể bị chặn tự động).");
    });
};
