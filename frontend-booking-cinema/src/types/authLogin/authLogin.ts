export interface LoginDTO {
    email: string;
    password: string;
}
export interface LoginResponse {
    token: string;
    refreshToken?: string;
    user: {
        _id: string;        
        fullname: string;
        role?: string;
        email: string;
        phone?: string;
    };
}