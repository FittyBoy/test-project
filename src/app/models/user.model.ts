export interface User {
  id: string;
  username: string;
  lastLogin?: Date;  // ⭐ เพิ่มบรรทัดนี้
  createdAt?: Date;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: User;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: User;
}
