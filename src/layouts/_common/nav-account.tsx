import { alpha } from '@mui/material/styles';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Badge, { badgeClasses } from '@mui/material/Badge';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
// routes
import { useRouter } from 'src/routes/hook';
import { paths } from 'src/routes/paths';
// auth
import { useAuthContext } from 'src/auth/hooks';
// components
import Iconify from 'src/components/iconify';
import { useSnackbar } from 'src/components/snackbar';
import { useSettingsContext } from 'src/components/settings';
import CustomPopover, { usePopover } from 'src/components/custom-popover';
import { IUser } from '../../types/user';

// ----------------------------------------------------------------------

type Props = {
  loggedUser: IUser | undefined;
  compact?: boolean;
};

export default function NavAccount({ loggedUser, compact = false }: Props) {
  const router = useRouter();
  const { logout } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();
  const settings = useSettingsContext();
  const popover = usePopover();

  const cargo =
    loggedUser?.roles
      ?.map((role) => role.displayName)
      .filter(Boolean)
      .join(', ') || '';

  const handleSettings = () => {
    popover.onClose();
    settings.onToggle();
  };

  const handleLogout = async () => {
    try {
      await logout();
      popover.onClose();
      router.replace(paths.auth.login);
    } catch (error) {
      enqueueSnackbar('Erro ao terminar sessão!', { variant: 'error' });
    }
  };

  const moreButton = (
    <Badge
      color="error"
      variant="dot"
      invisible={!settings.canReset}
      sx={{
        [`& .${badgeClasses.badge}`]: {
          top: 8,
          right: 8,
        },
      }}
    >
      <IconButton
        onClick={popover.onOpen}
        aria-label="Mais opções da conta"
        sx={{
          width: 36,
          height: 36,
          color: 'common.white',
          flexShrink: 0,
        }}
      >
        <Iconify icon="eva:more-vertical-fill" width={20} />
      </IconButton>
    </Badge>
  );

  const menu = (
    <CustomPopover open={popover.open} onClose={popover.onClose} sx={{ width: 200, p: 1 }}>
      <MenuItem onClick={handleSettings}>
        <ListItemIcon>
          <Badge color="error" variant="dot" invisible={!settings.canReset}>
            <Iconify icon="solar:settings-bold-duotone" width={20} />
          </Badge>
        </ListItemIcon>
        <ListItemText primary="Configurações" primaryTypographyProps={{ typography: 'body2' }} />
      </MenuItem>

      <Divider sx={{ borderStyle: 'dashed', my: 0.5 }} />

      <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
        <ListItemIcon sx={{ color: 'inherit' }}>
          <Iconify icon="solar:logout-2-outline" width={20} />
        </ListItemIcon>
        <ListItemText
          primary="Terminar sessão"
          primaryTypographyProps={{ typography: 'body2', fontWeight: 'fontWeightBold' }}
        />
      </MenuItem>
    </CustomPopover>
  );

  if (compact) {
    return (
      <>
        <Stack alignItems="center" spacing={1}>
          <Avatar
            src={loggedUser?.photo}
            alt={loggedUser?.name}
            sx={{
              width: 36,
              height: 36,
              border: (theme) => `solid 2px ${alpha(theme.palette.common.white, 0.16)}`,
            }}
          />
          {moreButton}
        </Stack>
        {menu}
      </>
    );
  }

  return (
    <>
      <Stack
        direction="row"
        alignItems="center"
        spacing={1.5}
        sx={{ width: 1, minWidth: 0 }}
      >
        <Avatar
          src={loggedUser?.photo}
          alt={loggedUser?.name}
          sx={{
            width: 40,
            height: 40,
            flexShrink: 0,
            border: (theme) => `solid 2px ${alpha(theme.palette.common.white, 0.16)}`,
          }}
        />

        <Stack sx={{ minWidth: 0, flex: '1 1 auto' }}>
          <Typography variant="subtitle2" noWrap sx={{ color: 'common.white' }}>
            {loggedUser?.name || '—'}
          </Typography>
          {cargo && (
            <Typography variant="caption" noWrap sx={{ color: 'grey.500' }}>
              {cargo}
            </Typography>
          )}
        </Stack>

        {moreButton}
      </Stack>
      {menu}
    </>
  );
}
