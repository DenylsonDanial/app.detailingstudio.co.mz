import { ReactNode } from 'react';
// @mui
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
// components
import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

export type MobileCardRow = {
  label: string;
  value: ReactNode;
  /** Linha de valor (total, saldo): rotulo e valor a negrito. */
  emphasis?: boolean;
  color?: string;
};

type Props = {
  title: ReactNode;
  subtitle?: ReactNode;
  status?: ReactNode;
  rows: MobileCardRow[];
  /** Quando existe, o cartao inteiro abre o detalhe e mostra um chevron. */
  onOpen?: VoidFunction;
  openLabel?: string;
  /** Accoes do registo (ex.: estornar), fora da area clicavel. */
  actions?: ReactNode;
};

/** Registo de uma listagem apresentado como cartao em ecras estreitos. */
export default function MobileCard({
  title,
  subtitle,
  status,
  rows,
  onOpen,
  openLabel,
  actions,
}: Props) {
  const body = (
    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
      <Stack direction="row" alignItems="flex-start" spacing={1.5}>
        <Box sx={{ minWidth: 0, flexGrow: 1 }}>
          <Typography variant="subtitle1" noWrap>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="caption" component="div" noWrap sx={{ color: 'text.secondary' }}>
              {subtitle}
            </Typography>
          )}
        </Box>
        {status}
        {onOpen && <Iconify icon="eva:chevron-right-fill" sx={{ mt: 0.5, flexShrink: 0 }} />}
      </Stack>

      {rows.length > 0 && <Divider sx={{ my: 1.5 }} />}

      <Stack spacing={1}>
        {rows.map((row) => (
          <Stack
            key={row.label}
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            spacing={2}
          >
            <Typography
              variant={row.emphasis ? 'body2' : 'caption'}
              sx={{
                flexShrink: 0,
                color: row.emphasis ? 'text.primary' : 'text.secondary',
                fontWeight: row.emphasis ? 600 : undefined,
              }}
            >
              {row.label}
            </Typography>
            <Box
              sx={{
                minWidth: 0,
                textAlign: 'right',
                typography: row.emphasis ? 'subtitle2' : 'body2',
                color: row.color,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {row.value}
            </Box>
          </Stack>
        ))}
      </Stack>
    </CardContent>
  );

  return (
    <Card>
      {onOpen ? (
        <CardActionArea onClick={onOpen} aria-label={openLabel}>
          {body}
        </CardActionArea>
      ) : (
        body
      )}
      {actions && (
        <>
          <Divider />
          <Stack direction="row" justifyContent="flex-end" spacing={1} sx={{ px: 1, py: 0.5 }}>
            {actions}
          </Stack>
        </>
      )}
    </Card>
  );
}
