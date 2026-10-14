import { useTheme } from '@mui/material/styles';
import Stack from '@mui/material/Stack';
import Badge from '@mui/material/Badge';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Drawer, { drawerClasses } from '@mui/material/Drawer';
import { paper } from 'src/theme/css';
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import type { ReactNode } from 'react';

// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  onClose: VoidFunction;
  filtersActive?: boolean;
  onResetFilters?: VoidFunction;
  children: ReactNode;
};

export default function FiltersDrawer({
  open,
  onClose,
  filtersActive,
  onResetFilters,
  children,
}: Props) {
  const theme = useTheme();

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{
        backdrop: { invisible: true },
      }}
      sx={{
        [`& .${drawerClasses.paper}`]: {
          ...paper({ theme, bgcolor: theme.palette.background.default }),
          width: 320,
        },
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ py: 2, pr: 1, pl: 2.5 }}
      >
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Filtros
        </Typography>

        {onResetFilters && (
          <Tooltip title="Limpar filtros">
            <IconButton onClick={onResetFilters}>
              <Badge color="error" variant="dot" invisible={!filtersActive}>
                <Iconify icon="solar:restart-bold" />
              </Badge>
            </IconButton>
          </Tooltip>
        )}

        <IconButton onClick={onClose}>
          <Iconify icon="mingcute:close-line" />
        </IconButton>
      </Stack>

      <Divider sx={{ borderStyle: 'dashed' }} />

      <Scrollbar>
        <Stack spacing={3} sx={{ p: 3 }}>
          {children}
        </Stack>
      </Scrollbar>
    </Drawer>
  );
}
