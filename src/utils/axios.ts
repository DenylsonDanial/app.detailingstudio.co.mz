import axios, { AxiosRequestConfig } from 'axios';
// config
import { HOST_API } from 'src/config-global';

// ----------------------------------------------------------------------

const axiosInstance = axios.create({ baseURL: HOST_API });

axiosInstance.interceptors.response.use(
  (res) => res,
  (error) => Promise.reject((error.response && error.response.data) || 'Ocorreu um erro inesperado')
);

/** Extrai a mensagem de um erro da API (ApiException, ProblemDetail ou string). */
export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === 'string' && error.trim()) {
    return error;
  }
  if (error && typeof error === 'object') {
    const body = error as Record<string, unknown>;
    const nested = body.data;
    if (nested && typeof nested === 'object') {
      const nestedBody = nested as Record<string, unknown>;
      for (const key of ['message', 'detail', 'description'] as const) {
        const value = nestedBody[key];
        if (typeof value === 'string' && value.trim()) {
          return value;
        }
      }
    }
    for (const key of ['message', 'detail', 'description'] as const) {
      const value = body[key];
      if (typeof value === 'string' && value.trim()) {
        return value;
      }
    }
  }
  return fallback;
}

export default axiosInstance;

// ----------------------------------------------------------------------

export const fetcher = async (args: string | [string, AxiosRequestConfig]) => {
  const [url, config] = Array.isArray(args) ? args : [args];

  const res = await axiosInstance.get(url, { ...config });

  return res.data;
};

// ----------------------------------------------------------------------

export const endpoints = {
  auth: {
    login: '/auth/login',
    refresh: '/auth/refresh',
    logout: '/auth/logout',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
    changePassword: '/auth/change-password',
    setPassword: '/auth/set-password',
    switchCompany: '/auth/switch-company',
    me: '/users/loggedUserInfo',
    myCompanies: '/users/myCompanies',
  },
  common: {
    countries: '/countries',
    provinces: '/provinces',
    districts: '/districts',
    companies: '/companies',
    export: '/reports/export',
  },
};
