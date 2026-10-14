// @mui
import { alpha, Shadows } from '@mui/material/styles';
//
import { palette as themePalette } from './palette';

// ----------------------------------------------------------------------

const palette = themePalette('light');

const LIGHT_MODE = palette.grey[500];

const DARK_MODE = palette.common.black;

function createShadow(color: string): Shadows {
  const transparent1 = alpha(color, 0.1);
  const transparent2 = alpha(color, 0.08);
  const transparent3 = alpha(color, 0.06);
  return [
    'none',
    `0px 1px 2px 0px ${transparent1}`,
    `0px 1px 3px 0px ${transparent1}`,
    `0px 2px 4px -1px ${transparent1}, 0px 4px 6px -1px ${transparent2}`,
    `0px 4px 6px -1px ${transparent1}, 0px 2px 4px -1px ${transparent2}`,
    `0px 10px 15px -3px ${transparent1}, 0px 4px 6px -2px ${transparent2}`,
    `0px 10px 15px -3px ${transparent1}, 0px 4px 6px -2px ${transparent2}`,
    `0px 20px 25px -5px ${transparent1}, 0px 10px 10px -5px ${transparent2}`,
    `0px 25px 50px -12px ${transparent1}`,
    `0px 25px 50px -12px ${transparent1}`,
    `0px 25px 50px -12px ${transparent1}`,
    `0px 25px 50px -12px ${transparent1}`,
    `0px 25px 50px -12px ${transparent1}`,
    `0px 25px 50px -12px ${transparent1}`,
    `0px 25px 50px -12px ${transparent1}`,
    `0px 25px 50px -12px ${transparent1}`,
    `0px 25px 50px -12px ${transparent1}`,
    `0px 25px 50px -12px ${transparent1}`,
    `0px 25px 50px -12px ${transparent1}`,
    `0px 25px 50px -12px ${transparent1}`,
    `0px 25px 50px -12px ${transparent1}`,
    `0px 25px 50px -12px ${transparent1}`,
    `0px 25px 50px -12px ${transparent1}`,
    `0px 25px 50px -12px ${transparent1}`,
    `0px 25px 50px -12px ${transparent1}`,
  ];
}

export function shadows(mode: 'light' | 'dark') {
  return mode === 'light' ? createShadow(LIGHT_MODE) : createShadow(DARK_MODE);
}
