import { Role } from "../services/auth-service";

export interface AuthState {
  isLoggedIn: boolean;
  roles: Role[];
  userId?: string | number;
  token?: string;
}