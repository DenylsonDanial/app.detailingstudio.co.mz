import { alpha } from '@mui/material/styles';

// ----------------------------------------------------------------------

export type ColorSchema = 'primary' | 'secondary' | 'info' | 'success' | 'warning' | 'error';

declare module '@mui/material/styles/createPalette' {
  interface TypeBackground {
    neutral: string;
  }
  interface SimplePaletteColorOptions {
    lighter: string;
    darker: string;
  }
  interface PaletteColor {
    lighter: string;
    darker: string;
  }
}

// ----------------------------------------------------------------------
// Paleta Detailing Studio (logotipo e site detailingstudio.co.mz):
//   #E6028A Magenta (logotipo, icones) | #CA0278 Magenta escuro (cabecalho, botoes)
//   #000000 Preto (fundo do site)      | #191717 Grafite (rodape) | #F5F5F5 cartoes
// Cinzentos neutros, a acompanhar o preto da marca.
// ----------------------------------------------------------------------

const GREY = {
  0: '#FFFFFF',
  100: '#F9F9F9',
  200: '#F5F5F5',
  300: '#E4E4E4',
  400: '#C8C8C8',
  500: '#9A9A9A',
  600: '#6E6E6E',
  700: '#4A4A4A',
  800: '#2A2727',
  900: '#191717',
};

const PRIMARY = {
  lighter: '#FFD1EA',
  light: '#F25AB4',
  main: '#E6028A',
  dark: '#CA0278',
  darker: '#7A0048',
  contrastText: '#FFFFFF',
};

const SECONDARY = {
  lighter: '#E4E4E4',
  light: '#4A4A4A',
  main: '#191717',
  dark: '#000000',
  darker: '#000000',
  contrastText: '#FFFFFF',
};

const INFO = {
  lighter: '#E0F2FE',
  light: '#7DD3FC',
  main: '#0EA5E9',
  dark: '#0284C7',
  darker: '#075985',
  contrastText: '#FFFFFF',
};

const SUCCESS = {
  lighter: '#D1FAE5',
  light: '#6EE7B7',
  main: '#10B981',
  dark: '#059669',
  darker: '#065F46',
  contrastText: '#FFFFFF',
};

const WARNING = {
  lighter: '#FEF3C7',
  light: '#FCD34D',
  main: '#F59E0B',
  dark: '#D97706',
  darker: '#92400E',
  contrastText: GREY[900],
};

const ERROR = {
  lighter: '#FEE2E2',
  light: '#FCA5A5',
  main: '#EF4444',
  dark: '#DC2626',
  darker: '#991B1B',
  contrastText: '#FFFFFF',
};

const COMMON = {
  common: {
    black: '#000000',
    white: '#FFFFFF',
  },
  primary: PRIMARY,
  secondary: SECONDARY,
  info: INFO,
  success: SUCCESS,
  warning: WARNING,
  error: ERROR,
  grey: GREY,
  divider: alpha(GREY[500], 0.2),
  action: {
    hover: alpha(GREY[500], 0.08),
    selected: alpha(GREY[500], 0.16),
    disabled: alpha(GREY[500], 0.8),
    disabledBackground: alpha(GREY[500], 0.24),
    focus: alpha(GREY[500], 0.24),
    hoverOpacity: 0.08,
    disabledOpacity: 0.48,
  },
};

// Gradientes modernos
export const gradients = {
  primary: `linear-gradient(135deg, ${PRIMARY.light} 0%, ${PRIMARY.main} 100%)`,
  secondary: `linear-gradient(135deg, ${SECONDARY.light} 0%, ${SECONDARY.main} 100%)`,
  info: `linear-gradient(135deg, ${INFO.light} 0%, ${INFO.main} 100%)`,
  success: `linear-gradient(135deg, ${SUCCESS.light} 0%, ${SUCCESS.main} 100%)`,
  warning: `linear-gradient(135deg, ${WARNING.light} 0%, ${WARNING.main} 100%)`,
  error: `linear-gradient(135deg, ${ERROR.light} 0%, ${ERROR.main} 100%)`,
  glass: `linear-gradient(135deg, ${alpha('#FFFFFF', 0.1)} 0%, ${alpha('#FFFFFF', 0.05)} 100%)`,
};

export function palette(mode: 'light' | 'dark') {
  const light = {
    ...COMMON,
    mode: 'light',
    text: {
      primary: GREY[800],
      secondary: GREY[700],
      disabled: GREY[600],
    },
    background: {
      paper: '#FFFFFF',
      default: GREY[100],
      neutral: GREY[200],
    },
    action: {
      ...COMMON.action,
      active: GREY[700],
    },
  };

  const dark = {
    ...COMMON,
    mode: 'dark',
    text: {
      // Branco sobre superfícies quase pretas; marca fica só em acentos
      primary: '#FFFFFF',
      secondary: alpha('#FFFFFF', 0.92),
      disabled: alpha('#FFFFFF', 0.48),
    },
    background: {
      // Hierarquia: canvas = sidebar → paper elevado → neutral (headers)
      // O magenta da marca NAO e fill — so CTAs e destaques, como no site
      paper: '#191717',
      default: '#000000',
      neutral: GREY[900],
    },
    action: {
      ...COMMON.action,
      active: '#FFFFFF',
      hover: alpha('#FFFFFF', 0.12),
      selected: alpha('#FFFFFF', 0.18),
      disabled: alpha('#FFFFFF', 0.4),
      disabledBackground: alpha('#FFFFFF', 0.12),
      focus: alpha('#FFFFFF', 0.24),
    },
    divider: alpha('#FFFFFF', 0.2),
  };

  return mode === 'light' ? light : dark;
}
