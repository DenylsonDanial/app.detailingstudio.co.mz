import { ReactNode } from 'react';
// @mui
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// ----------------------------------------------------------------------

export type MobileListItem = {
  key: string | number;
  primary: ReactNode;
  secondary?: ReactNode;
  value?: ReactNode;
  valueColor?: string;
  /** Accoes da linha (ex.: editar), numa linha propria por baixo. */
  actions?: ReactNode;
};

type Props = {
  items: MobileListItem[];
  emptyText?: string;
  /** Linha final a negrito (ex.: total). */
  footer?: { label: ReactNode; value: ReactNode };
};

/**
 * Versao empilhada de uma tabela dentro de um cartao de detalhe. So aparece
 * abaixo de sm; a tabela correspondente deve ficar escondida nesse intervalo.
 */
export default function MobileList({ items, emptyText, footer }: Props) {
  return (
    <Stack divider={<Divider />} sx={{ display: { xs: 'flex', sm: 'none' }, px: 2, pb: 1 }}>
      {items.length === 0 && emptyText && (
        <Typography variant="body2" sx={{ color: 'text.secondary', py: 2 }}>
          {emptyText}
        </Typography>
      )}

      {items.map((item) => (
        <Box key={item.key} sx={{ py: 1.5 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, wordBreak: 'break-word' }}>
                {item.primary}
              </Typography>
              {item.secondary && (
                <Typography
                  variant="caption"
                  component="div"
                  sx={{ color: 'text.secondary', wordBreak: 'break-word' }}
                >
                  {item.secondary}
                </Typography>
              )}
            </Box>
            {item.value !== undefined && (
              <Typography
                variant="subtitle2"
                sx={{ whiteSpace: 'nowrap', flexShrink: 0, color: item.valueColor }}
              >
                {item.value}
              </Typography>
            )}
          </Stack>
          {item.actions && (
            <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ mt: 1 }}>
              {item.actions}
            </Stack>
          )}
        </Box>
      ))}

      {footer && (
        <Stack direction="row" justifyContent="space-between" sx={{ py: 1.5 }}>
          <Typography variant="subtitle2">{footer.label}</Typography>
          <Typography variant="subtitle2" sx={{ whiteSpace: 'nowrap' }}>
            {footer.value}
          </Typography>
        </Stack>
      )}
    </Stack>
  );
}
