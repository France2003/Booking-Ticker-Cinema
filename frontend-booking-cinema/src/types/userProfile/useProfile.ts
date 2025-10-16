export interface UserProfile {
  _id: string;
  fullname: string;
  email: string;
  phone?: string;
  dateofbirth?: string;
  gender?: 'Nam' | 'Nữ' | 'Khác';
  address?: string;
  trangThai?: string;
  lichsuDatVe?: any[];
}
export interface UpdateProfileData {
    fullname?: string;
    email?: string;
    phone?: string;
    dateofbirth?: string;
    gender?: 'Nam' | 'Nữ' | 'Khác';
    address?: string;
}