import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';
import Iconify from 'src/components/iconify';
import CustomPopover, { usePopover } from 'src/components/custom-popover';

// ----------------------------------------------------------------------

export default function TopbarMoreMenu() {
  const popover = usePopover();

  return (
    <>
      <IconButton onClick={popover.onOpen} aria-label="Mais opções da top bar">
        <Iconify icon="eva:more-vertical-fill" />
      </IconButton>

      <CustomPopover open={popover.open} onClose={popover.onClose} sx={{ width: 220, p: 1 }}>
        <MenuItem disabled>
          <ListItemText
            primary="Organizar topbar"
            secondary="Em breve"
            primaryTypographyProps={{ typography: 'body2' }}
            secondaryTypographyProps={{ typography: 'caption' }}
          />
        </MenuItem>
      </CustomPopover>
    </>
  );
}
