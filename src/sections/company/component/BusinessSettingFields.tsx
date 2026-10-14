import React from 'react';
import { Grid, Typography } from '@mui/material';
import { RHFTextField } from '../../../components/hook-form';

export const BusinessSettingFields: React.FC = () => (
  <Grid container spacing={2} sx={{ width: '100%' }}>
    <Grid xs={12} md={8} item>
      <RHFTextField
        required
        name="businessSetting.businessName"
        size="small"
        label="Nome da empresa"
      />
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
        O restante perfil da empresa (NUIT, contactos, morada, logótipo e moeda) pode ser completado
        depois em Definições.
      </Typography>
    </Grid>
  </Grid>
);
