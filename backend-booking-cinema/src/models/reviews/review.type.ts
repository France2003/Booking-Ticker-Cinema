export interface IReview {
    _id?: string;
    movieId: string;
    userId: string;
    rating: number;
    comment?: string;
    likes?: string[];
    createdAt?: Date;
}
