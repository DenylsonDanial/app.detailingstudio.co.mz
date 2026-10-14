import React from 'react';
import Typography from '@mui/material/Typography';
import { Stack } from '@mui/material';
import Iconify from '../../../components/iconify';

export const FinishSetup: React.FC = () => (
  <Stack
    sx={{
      height: '300px',
      display: 'flex',
      flexDirection: 'column',
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    <Iconify width={200} icon="mdi:shield-alert-outline" />
    <Typography sx={{ mt: 2, mb: 1 }} align="center">
      Confirme o nome da empresa e o administrador antes de submeter. O restante perfil (NUIT,
      contactos, morada e logótipo) completa-se depois em Definições.
    </Typography>
  </Stack>
);
