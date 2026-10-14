import { type ReactNode } from 'react';
import Box from '@mui/material/Box';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';
import Iconify from 'src/components/iconify';
import CustomPopover, { usePopover } from 'src/components/custom-popover';

// ----------------------------------------------------------------------

type Props = {
  actions?: ReactNode;
};

export default function TopbarMoreMenu({ actions }: Props) {
  const popover = usePopover();

  return (
    <>
      <IconButton
        onClick={popover.onOpen}
        aria-label="Mais opções da top bar"
        sx={{ width: 44, height: 44, flexShrink: 0 }}
      >
        <Iconify icon="eva:more-vertical-fill" />
      </IconButton>

      <CustomPopover open={popover.open} onClose={popover.onClose} sx={{ width: 220, p: 1 }}>
        {actions ? (
          <Box sx={{ '& .MuiButton-root': { width: 1, justifyContent: 'flex-start' } }}>
            {actions}
          </Box>
        ) : (
          <MenuItem disabled>
            <ListItemText
              primary="Organizar topbar"
              secondary="Em breve"
              primaryTypographyProps={{ typography: 'body2' }}
              secondaryTypographyProps={{ typography: 'caption' }}
            />
          </MenuItem>
        )}
      </CustomPopover>
    </>
  );
}
