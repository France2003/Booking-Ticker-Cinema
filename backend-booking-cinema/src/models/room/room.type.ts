export interface IRoom {
    name: string;      
    totalSeats: number;
    type: "2D" | "3D" | "IMAX";
    seats: ISeat[];
}
export interface ISeat {
    seatNumber: string;
    type: "Double" | "Triple" | "VIP" | "Normal";
    price: number;
    isBooked?: boolean; 
}
