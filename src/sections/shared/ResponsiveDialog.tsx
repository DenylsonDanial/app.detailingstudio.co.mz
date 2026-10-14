import Dialog, { DialogProps } from '@mui/material/Dialog';
// hooks
import { useResponsive } from 'src/hooks/use-responsive';

// ----------------------------------------------------------------------

/**
 * Dialog que ocupa o ecra inteiro em telemoveis: o conteudo faz scroll e as
 * accoes ficam fixas em baixo, respeitando a zona segura (safe-area) do iOS.
 */
export default function ResponsiveDialog({ sx, ...other }: DialogProps) {
  const mobile = useResponsive('down', 'sm');

  return (
    <Dialog
      fullScreen={mobile}
      {...other}
      sx={{
        '& .MuiDialogActions-root': {
          gap: 1,
          ...(mobile && {
            borderTop: (theme) => `solid 1px ${theme.palette.divider}`,
            pb: 'calc(16px + env(safe-area-inset-bottom))',
            '& > .MuiButton-root': { flex: 1, minHeight: 44, ml: 0 },
          }),
        },
        ...(mobile && { '& .MuiDialogContent-root': { px: 2 } }),
        ...(Array.isArray(sx) ? {} : sx),
      }}
    />
  );
}
