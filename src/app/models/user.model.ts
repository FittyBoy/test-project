export interface User {
  id?: string;
  username: string;
  password: string;
  lastLoginTime?: Date;
  createdAt?: Date;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  user?: User;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  user?: User;
}
