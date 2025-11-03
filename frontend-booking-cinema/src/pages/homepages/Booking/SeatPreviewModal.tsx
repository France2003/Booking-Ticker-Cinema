import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { ARButton, XR } from "@react-three/xr";
import { useRef, useEffect } from "react";

interface SeatPreviewModalProps {
    seat: string;
    onClose: () => void;
}

export default function SeatPreviewModal({ seat, onClose }: SeatPreviewModalProps) {
    const cameraRef = useRef<any>(null);

    // Đặt góc nhìn tương ứng ghế
    useEffect(() => {
        if (!cameraRef.current) return;
        const row = seat[0].charCodeAt(0) - 65; // A=0
        const col = parseInt(seat.slice(1)) - 1;
        // tọa độ ghế trong không gian rạp
        cameraRef.current.position.set(col * 0.5 - 4, 1.2, row * 0.8 + 3);
    }, [seat]);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-gray-900 rounded-2xl overflow-hidden relative w-[90%] max-w-4xl h-[70vh]">
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 bg-gray-800 text-white px-3 py-1 rounded-md text-sm hover:bg-red-500 transition"
                >
                    ✕ Đóng
                </button>

                {/* WebXR (AR thật) */}
                <ARButton sessionInit={{ optionalFeatures: ['local-floor', 'bounded-floor'] }} />

                <Canvas>
                    <XR>
                        <PerspectiveCamera ref={cameraRef} makeDefault fov={60} />
                        <ambientLight intensity={0.5} />
                        <directionalLight position={[5, 5, 5]} />

                        {/* Màn chiếu */}
                        <mesh position={[0, 2, -6]}>
                            <planeGeometry args={[8, 4]} />
                            <meshStandardMaterial emissive="#ffffff" emissiveIntensity={1.5} color="#fefefe" />
                        </mesh>

                        {/* Ghế mẫu */}
                        {Array.from({ length: 10 }).map((_, row) =>
                            Array.from({ length: 16 }).map((_, col) => {
                                const seatId = `${String.fromCharCode(65 + row)}${col + 1}`;
                                const isSelected = seatId === seat;
                                return (
                                    <mesh
                                        key={seatId}
                                        position={[col * 0.5 - 4, 0, row * 0.8]}
                                        scale={isSelected ? 1.2 : 1}
                                    >
                                        <boxGeometry args={[0.4, 0.3, 0.4]} />
                                        <meshStandardMaterial
                                            color={isSelected ? "#4ade80" : "#999"}
                                            emissive={isSelected ? "#4ade80" : "#333"}
                                            emissiveIntensity={isSelected ? 1 : 0.2}
                                        />
                                    </mesh>
                                );
                            })
                        )}

                        <OrbitControls target={[0, 1.5, -6]} />
                    </XR>
                </Canvas>
            </div>
        </div>
    );
}
