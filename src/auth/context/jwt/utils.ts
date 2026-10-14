import {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
  fetchBaseQuery,
} from '@reduxjs/toolkit/query';
// routes
import { paths } from 'src/routes/paths';
// utils
import axios, { endpoints } from 'src/utils/axios';
import { HOST_API, PATH_AFTER_LOGIN } from 'src/config-global';
import { Roles } from 'src/utils/authorities';
import { AuthUserType } from '../../types';

// ----------------------------------------------------------------------
// O access token vive apenas em memoria: nao fica exposto a XSS atraves de
// localStorage e desaparece quando o separador e fechado. O refresh token, de
// vida longa, fica em localStorage para permitir "manter sessao iniciada".
// Passo seguinte de endurecimento: mover o refresh token para um cookie
// httpOnly emitido pela API (ver docs/01-ARQUITECTURA.md).
// ----------------------------------------------------------------------

const REFRESH_TOKEN_KEY = 'eg.refreshToken';
const ACTIVE_TENANT_KEY = 'eg.activeTenant';

let accessTokenInMemory: string | null = null;
let refreshTimer: ReturnType<typeof setTimeout> | undefined;

export function jwtDecode(token: string | null) {
  if (!token) {
    return { authorities: [] as string[] };
  }
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split('')
        .map((c) => `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`)
        .join('')
    );

    return JSON.parse(jsonPayload);
  } catch {
    return { authorities: [] as string[] };
  }
}

export const isValidToken = (token: string | null) => {
  if (!token) {
    return false;
  }
  const decoded = jwtDecode(token);
  return typeof decoded.exp === 'number' && decoded.exp > Date.now() / 1000;
};

export const getAccessToken = () => accessTokenInMemory;

export const getRefreshToken = () => localStorage.getItem(REFRESH_TOKEN_KEY);

export const getActiveTenant = (): string | null => localStorage.getItem(ACTIVE_TENANT_KEY);

export const setActiveTenant = (tenantId: string | null) => {
  if (tenantId) {
    localStorage.setItem(ACTIVE_TENANT_KEY, tenantId);
  } else {
    localStorage.removeItem(ACTIVE_TENANT_KEY);
  }
};

const persistTenantFromToken = (accessToken: string | null) => {
  if (!accessToken) {
    localStorage.removeItem(ACTIVE_TENANT_KEY);
    return;
  }
  const { tenantId } = jwtDecode(accessToken);
  if (typeof tenantId === 'string' && tenantId) {
    localStorage.setItem(ACTIVE_TENANT_KEY, tenantId);
  }
};

/**
 * Renova o access token antes de expirar, com uma margem de 60 segundos.
 * Se a renovacao falhar, a sessao e encerrada e o utilizador volta ao login.
 */
const scheduleRefresh = (exp?: number) => {
  clearTimeout(refreshTimer);
  if (!exp) {
    return;
  }
  const msUntilRefresh = exp * 1000 - Date.now() - 60_000;
  refreshTimer = setTimeout(() => {
    refreshSession().catch(() => endSession(true));
  }, Math.max(msUntilRefresh, 5_000));
};

export const setSession = (accessToken: string | null, refreshToken?: string | null) => {
  accessTokenInMemory = accessToken;

  if (accessToken) {
    axios.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
    const decoded = jwtDecode(accessToken);
    scheduleRefresh(decoded.exp);
    persistTenantFromToken(accessToken);
  } else {
    delete axios.defaults.headers.common.Authorization;
    clearTimeout(refreshTimer);
    persistTenantFromToken(null);
  }

  if (refreshToken !== undefined) {
    if (refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    } else {
      localStorage.removeItem(REFRESH_TOKEN_KEY);
    }
  }
};

export const endSession = (redirect = false) => {
  setSession(null, null);
  if (redirect) {
    window.location.href = paths.auth.login;
  }
};

/** Devolve o novo access token ou lanca se a sessao ja nao for renovavel. */
export const refreshSession = async (): Promise<string> => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    throw new Error('Sessao expirada');
  }

  const { data } = await axios.post(endpoints.auth.refresh, {
    refreshToken,
    tenantId: getActiveTenant() ?? undefined,
  });
  setSession(data.accessToken, data.refreshToken);
  return data.accessToken;
};

// ----------------------------------------------------------------------
// RTK Query
// ----------------------------------------------------------------------

const rawBaseQuery = fetchBaseQuery({
  baseUrl: HOST_API,
  prepareHeaders: (headers) => {
    if (accessTokenInMemory) {
      headers.set('Authorization', `Bearer ${accessTokenInMemory}`);
    }
    return headers;
  },
});

let refreshInFlight: Promise<string> | null = null;

/**
 * Base query que renova o token uma vez perante um 401 e repete o pedido.
 * Pedidos concorrentes partilham a mesma renovacao.
 */
export const customBaseQuery: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  if (result.error?.status === 401 && getRefreshToken()) {
    try {
      refreshInFlight = refreshInFlight ?? refreshSession();
      await refreshInFlight;
      result = await rawBaseQuery(args, api, extraOptions);
    } catch {
      endSession(true);
    } finally {
      refreshInFlight = null;
    }
  }

  return result;
};

// ----------------------------------------------------------------------
// Autorizacao
// ----------------------------------------------------------------------

const currentAuthorities = (): string[] => jwtDecode(accessTokenInMemory).authorities ?? [];

/** Verdadeiro se o utilizador tiver pelo menos uma das permissoes pedidas. */
export const hasPermission = (required: string[]): boolean => {
  const granted = currentAuthorities();
  return required.some((item) => granted.includes(item));
};

/** Verdadeiro apenas se o utilizador tiver todas as permissoes pedidas. */
export const hasAllPermissions = (required: string[]): boolean => {
  const granted = currentAuthorities();
  return required.every((item) => granted.includes(item));
};

export const hasRole = (role: Roles): boolean => currentAuthorities().includes(role);

export const isAdmin = () => hasRole(Roles.MANAGER) || hasRole(Roles.SA);

export const isSuperAdmin = () => hasRole(Roles.SA);

/** Primeiro acesso: a API deixa passwordChangedAt a null ate a senha definitiva. */
export const needsPasswordChange = (user: AuthUserType): boolean =>
  user != null && !user.passwordChangedAt;

export const pathAfterAuthentication = () =>
  isSuperAdmin() ? paths.dashboard.company.list : PATH_AFTER_LOGIN;

export const getCurrentCompany = (): string | null =>
  jwtDecode(accessTokenInMemory).tenantId ?? null;
