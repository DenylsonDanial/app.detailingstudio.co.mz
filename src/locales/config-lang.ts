// @mui
import { enUS, ptBR } from '@mui/material/locale';

// ----------------------------------------------------------------------

export const allLangs = [
  {
    label: 'Português',
    value: 'pt',
    systemValue: ptBR,
    icon: 'flagpack:pt',
  },
  {
    label: 'English',
    value: 'en',
    systemValue: enUS,
    icon: 'flagpack:gb-nir',
  },
];

export const defaultLang = allLangs[0];
