export interface ISeat {
    seatNumber: string;
    type: "Normal"| "VIP"| "Double"|"Triple"
    price: number;
    isBooked?: boolean;
}
export interface IRoom {
    _id: string;
    name: string;
    type: "2D" | "3D" | "IMAX";
    totalSeats: number;
    seats: ISeat[];
    createdAt?: string;
    updatedAt?: string;
}
export interface CreateRoomPayload {
    name: string;
    type: "2D" | "3D" | "IMAX";
    totalSeats: number;
}
export interface CreateSeatPayload {
    seatNumber: string;
    type: "Normal"| "VIP"| "Double"|"Triple"
    price: number;
    isBooked: boolean;
}
