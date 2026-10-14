import { paths } from 'src/routes/paths';

// ----------------------------------------------------------------------

/**
 * A API e escolhida por variavel de ambiente (VITE_HOST_API). O fallback por
 * hostname existe para o caso de a build ser publicada sem a variavel definida.
 */
const apiByHostname: Record<string, string> = {
  'app.detailingstudio.co.mz': 'https://api.detailingstudio.co.mz/',
};

export const HOST_API: string =
  import.meta.env.VITE_HOST_API ||
  apiByHostname[window.location.hostname] ||
  'http://localhost:8090/';

export const ASSETS_API = import.meta.env.VITE_ASSETS_API ?? '';

export const APP_NAME = 'Detailing Studio';

export const PATH_AFTER_LOGIN = paths.dashboard.root;
