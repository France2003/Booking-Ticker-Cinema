export interface MovieRef {
    _id: string;
    tieuDe: string;
}

export interface RoomRef {
    _id: string;
    name: string;
}

export interface Showtime {
    _id: string;
    movieId: MovieRef;
    roomId: RoomRef;
    date: string;
    startTime: string;
    endTime: string;
    price: number;
}
