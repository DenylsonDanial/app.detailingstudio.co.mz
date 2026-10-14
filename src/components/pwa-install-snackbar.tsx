import { useCallback, useEffect, useState } from 'react';
// @mui
import Button from '@mui/material/Button';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Typography from '@mui/material/Typography';
// hooks
import { usePwaInstall } from 'src/hooks/use-pwa-install';

// ----------------------------------------------------------------------

export default function PwaInstallSnackbar() {
  const {
    canInstall,
    showIosInstallHelp,
    showSuggestion,
    promptInstall,
    dismissSuggestion,
  } = usePwaInstall();

  const [open, setOpen] = useState(false);
  const [iosHelpOpen, setIosHelpOpen] = useState(false);

  useEffect(() => {
    if (!showSuggestion) {
      setOpen(false);
      return undefined;
    }

    const timer = window.setTimeout(() => setOpen(true), 2500);
    return () => window.clearTimeout(timer);
  }, [showSuggestion]);

  const onDismiss = useCallback(() => {
    setOpen(false);
    dismissSuggestion();
  }, [dismissSuggestion]);

  const onInstall = useCallback(async () => {
    if (canInstall) {
      setOpen(false);
      const accepted = await promptInstall();
      if (!accepted) {
        dismissSuggestion();
      }
      return;
    }

    if (showIosInstallHelp) {
      setOpen(false);
      setIosHelpOpen(true);
    }
  }, [canInstall, showIosInstallHelp, promptInstall, dismissSuggestion]);

  const onCloseIosHelp = useCallback(() => {
    setIosHelpOpen(false);
    dismissSuggestion();
  }, [dismissSuggestion]);

  return (
    <>
      <Snackbar
        open={open}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={{ mb: { xs: 1, sm: 2 } }}
      >
        <Alert
          severity="info"
          variant="filled"
          onClose={onDismiss}
          action={
            <>
              <Button color="inherit" size="small" onClick={onInstall} sx={{ fontWeight: 700 }}>
                Instalar
              </Button>
              <Button color="inherit" size="small" onClick={onDismiss}>
                Agora não
              </Button>
            </>
          }
          sx={{ alignItems: 'center', width: '100%', maxWidth: 480 }}
        >
          Instale o Detailing Studio no telemóvel ou computador para acesso rápido.
        </Alert>
      </Snackbar>

      <Dialog open={iosHelpOpen} onClose={onCloseIosHelp} maxWidth="xs" fullWidth>
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
          <Button onClick={onCloseIosHelp} variant="contained">
            Entendi
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
