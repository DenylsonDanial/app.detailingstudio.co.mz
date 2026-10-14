// @mui
import { alpha } from '@mui/material/styles';
//
import { palette as themePalette } from './palette';

// ----------------------------------------------------------------------

interface CustomShadowOptions {
  z1: string;
  z4: string;
  z8: string;
  z12: string;
  z16: string;
  z20: string;
  z24: string;
  //
  primary: string;
  secondary: string;
  info: string;
  success: string;
  warning: string;
  error: string;
  //
  card: string;
  dialog: string;
  dropdown: string;
}

declare module '@mui/material/styles' {
  interface Theme {
    customShadows: CustomShadowOptions;
  }
  interface ThemeOptions {
    customShadows?: CustomShadowOptions;
  }
}

// ----------------------------------------------------------------------

const palette = themePalette('light');

const LIGHT_MODE = palette.grey[500];

const DARK_MODE = palette.common.black;

function createShadow(color: string) {
  const transparent = alpha(color, 0.1);
  return {
    z1: `0 1px 2px 0 ${alpha(color, 0.06)}`,
    z4: `0 4px 6px -1px ${alpha(color, 0.1)}, 0 2px 4px -1px ${alpha(color, 0.06)}`,
    z8: `0 10px 15px -3px ${alpha(color, 0.1)}, 0 4px 6px -2px ${alpha(color, 0.05)}`,
    z12: `0 20px 25px -5px ${alpha(color, 0.1)}, 0 10px 10px -5px ${alpha(color, 0.04)}`,
    z16: `0 25px 50px -12px ${alpha(color, 0.25)}`,
    z20: `0 25px 50px -12px ${alpha(color, 0.25)}`,
    z24: `0 25px 50px -12px ${alpha(color, 0.25)}`,
    //
    card: `0 1px 3px 0 ${alpha(color, 0.1)}, 0 1px 2px 0 ${alpha(color, 0.06)}`,
    dropdown: `0 10px 15px -3px ${alpha(color, 0.1)}, 0 4px 6px -2px ${alpha(color, 0.05)}`,
    dialog: `0 25px 50px -12px ${alpha(palette.common.black, 0.25)}`,
    //
    primary: `0 10px 15px -3px ${alpha(palette.primary.main, 0.2)}`,
    info: `0 10px 15px -3px ${alpha(palette.info.main, 0.2)}`,
    secondary: `0 10px 15px -3px ${alpha(palette.secondary.main, 0.2)}`,
    success: `0 10px 15px -3px ${alpha(palette.success.main, 0.2)}`,
    warning: `0 10px 15px -3px ${alpha(palette.warning.main, 0.2)}`,
    error: `0 10px 15px -3px ${alpha(palette.error.main, 0.2)}`,
  };
}

export function customShadows(mode: 'light' | 'dark') {
  return mode === 'light' ? createShadow(LIGHT_MODE) : createShadow(DARK_MODE);
}
