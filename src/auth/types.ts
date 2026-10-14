// ----------------------------------------------------------------------

export type ActionMapType<M extends { [index: string]: any }> = {
  [Key in keyof M]: M[Key] extends undefined
    ? {
        type: Key;
      }
    : {
        type: Key;
        payload: M[Key];
      };
};

export type AuthUserType = null | Record<string, any>;

export type AuthStateType = {
  status?: string;
  loading: boolean;
  user: AuthUserType;
};

// ----------------------------------------------------------------------

/** Resposta de /auth/login e /auth/refresh. */
export type AuthResponse = {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  username: string;
  name: string;
  tenantId: string | null;
  authorities: string[];
  mustChangePassword: boolean;
};

export type JWTContextType = {
  user: AuthUserType;
  method: string;
  loading: boolean;
  authenticated: boolean;
  unauthenticated: boolean;
  //
  login: (username: string, password: string, tenantId?: string) => Promise<AuthResponse>;
  setInitialPassword: (password: string, passwordConfirm: string) => Promise<AuthResponse>;
  logout: () => Promise<void>;
};
