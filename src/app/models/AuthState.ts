const ALL_ROLES = ['ADMINISTRADOR','RECEPCIONISTA','CONSERJE','LIMPIEZA','CLIENTE'] as const;
export type Role = typeof ALL_ROLES[number];

export default interface AuthState {
  isLoggedIn: boolean;
  roles: Role[];
  userId?: string | number;
  token?: string;
}

