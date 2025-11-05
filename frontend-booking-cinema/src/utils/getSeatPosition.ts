// utils/getSeatPosition.ts
import * as THREE from "three";

/**
 * Trả về tọa độ 3D của ghế theo mã ví dụ "C7"
 */
export function getSeatPosition(seat: string) {
    const row = seat.charCodeAt(0) - 65; // A=0, B=1, ...
    const col = parseInt(seat.slice(1)); // 1..16
    const totalCols = 16;
    const centerCol = totalCols / 2 + 0.5; // 8.5

    // Thông số hình học rạp
    const RADIUS = 16; // độ cong
    const ROW_SPACING = 0.9;
    const HEIGHT_STEP = 0.35;
    const WALKWAY_WIDTH = 1.8;

    const isRightSide = col > centerCol;
    const colOffset = (isRightSide ? col - centerCol : centerCol - col) * 0.2;
    const sideSign = isRightSide ? 1 : -1;

    const angle = colOffset * sideSign;
    const x = Math.sin(angle) * RADIUS + (isRightSide ? WALKWAY_WIDTH / 2 : -WALKWAY_WIDTH / 2);
    const z = Math.cos(angle) * RADIUS + row * ROW_SPACING;
    const y = 0.4 + row * HEIGHT_STEP;

    return new THREE.Vector3(x, y, z);
}
