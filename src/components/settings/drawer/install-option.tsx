import { useCallback, useState } from 'react';
// @mui
import { alpha } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ButtonBase from '@mui/material/ButtonBase';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Typography from '@mui/material/Typography';
// hooks
import { usePwaInstall } from 'src/hooks/use-pwa-install';
//
import Iconify from '../../iconify';

// ----------------------------------------------------------------------

export default function InstallOption() {
  const { canInstall, isInstalled, showIosInstallHelp, promptInstall } = usePwaInstall();
  const [iosHelpOpen, setIosHelpOpen] = useState(false);

  const onInstall = useCallback(async () => {
    if (canInstall) {
      await promptInstall();
      return;
    }

    if (showIosInstallHelp) {
      setIosHelpOpen(true);
    }
  }, [canInstall, showIosInstallHelp, promptInstall]);

  if (isInstalled) {
    return (
      <Box sx={{ px: 2.5, pb: 2.5, pt: 0 }}>
        <Box
          sx={{
            width: 1,
            height: 48,
            borderRadius: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'text.disabled',
            typography: 'subtitle2',
            border: (theme) => `solid 1px ${alpha(theme.palette.grey[500], 0.08)}`,
          }}
        >
          <Iconify icon="solar:check-circle-bold" width={16} sx={{ mr: 1 }} />
          Já instalado
        </Box>
      </Box>
    );
  }

  if (!canInstall && !showIosInstallHelp) {
    return null;
  }

  return (
    <>
      <Box sx={{ px: 2.5, pb: 2.5, pt: 0 }}>
        <ButtonBase
          onClick={onInstall}
          sx={{
            width: 1,
            height: 48,
            borderRadius: 1,
            color: 'text.primary',
            typography: 'subtitle2',
            border: (theme) => `solid 1px ${alpha(theme.palette.grey[500], 0.08)}`,
            '& .install-icon': {
              color: 'primary.main',
            },
          }}
        >
          <Iconify icon="solar:download-minimalistic-bold" width={16} className="install-icon" sx={{ mr: 1 }} />
          Instalar no dispositivo
        </ButtonBase>
      </Box>

      <Dialog open={iosHelpOpen} onClose={() => setIosHelpOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Instalar no iPhone / iPad</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" paragraph>
            No Safari, adicione o Detailing Studio ao ecrã principal:
          </Typography>
          <Typography variant="body2" component="ol" sx={{ pl: 2.5, m: 0, '& li': { mb: 1 } }}>
            <li>Toque em Partilhar (ícone com seta para cima).</li>
            <li>Escolha &quot;Adicionar ao ecrã principal&quot;.</li>
            <li>Confirme em Adicionar.</li>
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIosHelpOpen(false)} variant="contained">
            Entendi
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
