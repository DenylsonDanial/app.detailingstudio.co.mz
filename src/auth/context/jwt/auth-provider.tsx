import { useCallback, useEffect, useMemo, useReducer } from 'react';
// utils
import axios, { endpoints } from 'src/utils/axios';
//
import { AuthContext } from './auth-context';
import { endSession, getRefreshToken, refreshSession, setSession } from './utils';
import { ActionMapType, AuthStateType, AuthUserType } from '../../types';

enum Types {
  INITIAL = 'INITIAL',
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
}

type Payload = {
  [Types.INITIAL]: { user: AuthUserType };
  [Types.LOGIN]: { user: AuthUserType };
  [Types.LOGOUT]: undefined;
};

type ActionsType = ActionMapType<Payload>[keyof ActionMapType<Payload>];

// ----------------------------------------------------------------------

const initialState: AuthStateType = {
  user: null,
  loading: true,
};

const reducer = (state: AuthStateType, action: ActionsType) => {
  if (action.type === Types.INITIAL) {
    return { loading: false, user: action.payload.user };
  }
  if (action.type === Types.LOGIN) {
    return { ...state, user: action.payload.user };
  }
  if (action.type === Types.LOGOUT) {
    return { ...state, user: null };
  }
  return state;
};

// ----------------------------------------------------------------------

type Props = {
  children: React.ReactNode;
};

export function AuthProvider({ children }: Props) {
  const [state, dispatch] = useReducer(reducer, initialState);

  /**
   * O access token vive em memoria, por isso um refresh da pagina perde-o.
   * A sessao e reconstruida a partir do refresh token guardado.
   */
  const initialize = useCallback(async () => {
    try {
      if (!getRefreshToken()) {
        dispatch({ type: Types.INITIAL, payload: { user: null } });
        return;
      }

      await refreshSession();
      const res = await axios.get(endpoints.auth.me);

      dispatch({ type: Types.INITIAL, payload: { user: res.data } });
    } catch (error) {
      endSession();
      dispatch({ type: Types.INITIAL, payload: { user: null } });
    }
  }, []);

  useEffect(() => {
    initialize();
  }, [initialize]);

  const login = useCallback(async (username: string, password: string, tenantId?: string) => {
    const res = await axios.post(endpoints.auth.login, { username, password, tenantId });

    const { accessToken, refreshToken } = res.data;
    setSession(accessToken, refreshToken);

    const me = await axios.get(endpoints.auth.me);
    dispatch({ type: Types.LOGIN, payload: { user: me.data } });

    return res.data;
  }, []);

  const setInitialPassword = useCallback(async (password: string, passwordConfirm: string) => {
    const res = await axios.post(endpoints.auth.setPassword, { password, passwordConfirm });

    const { accessToken, refreshToken } = res.data;
    setSession(accessToken, refreshToken);

    const me = await axios.get(endpoints.auth.me);
    dispatch({ type: Types.LOGIN, payload: { user: me.data } });

    return res.data;
  }, []);

  const logout = useCallback(async () => {
    const refreshToken = getRefreshToken();
    if (refreshToken) {
      // O servidor revoga o token; uma falha de rede nao deve impedir a saida local.
      await axios.post(endpoints.auth.logout, { refreshToken }).catch(() => undefined);
    }
    endSession();
    dispatch({ type: Types.LOGOUT });
  }, []);

  // ----------------------------------------------------------------------

  const checkAuthenticated = state.user ? 'authenticated' : 'unauthenticated';
  const status = state.loading ? 'loading' : checkAuthenticated;

  const memoizedValue = useMemo(
    () => ({
      user: state.user,
      method: 'jwt',
      loading: status === 'loading',
      authenticated: status === 'authenticated',
      unauthenticated: status === 'unauthenticated',
      //
      login,
      setInitialPassword,
      logout,
    }),
    [login, setInitialPassword, logout, state.user, status]
  );

  return <AuthContext.Provider value={memoizedValue}>{children}</AuthContext.Provider>;
}
