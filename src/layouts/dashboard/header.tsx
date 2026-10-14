// @mui
import { useTheme } from '@mui/material/styles';
import Stack from '@mui/material/Stack';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Popover from '@mui/material/Popover';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Button from '@mui/material/Button';
import Badge from '@mui/material/Badge';
// theme
import { bgBlur } from 'src/theme/css';
// hooks
import { useOffSetTop } from 'src/hooks/use-off-set-top';
import { useResponsive } from 'src/hooks/use-responsive';
// components
import Logo from 'src/components/logo';
import SvgColor from 'src/components/svg-color';
import Iconify from 'src/components/iconify';
import { useSettingsContext } from 'src/components/settings';
//
import { HEADER, NAV } from '../config-layout';
import { useCallback, useEffect, useState } from 'react';
import { IUser } from '../../types/user';
import { useGetLoggedUserMutation } from '../../redux/services/userService';
import CompanySwitch from '../_common/company-switch';
import { usePageHeaderState } from './page-header-context';
import TopbarMoreMenu from './topbar-more-menu';
import FiltersDrawer from './filters-drawer';

// ----------------------------------------------------------------------

type Props = {
  onOpenNav?: VoidFunction;
};

export default function Header({ onOpenNav }: Props) {
  const theme = useTheme();

  const settings = useSettingsContext();

  const { title, filters, filtersActive, onResetFilters, actions, search } = usePageHeaderState();

  const isNavHorizontal = settings.themeLayout === 'horizontal';

  const isNavMini = settings.themeLayout === 'mini';

  const lgUp = useResponsive('up', 'lg');

  const offset = useOffSetTop(HEADER.H_DESKTOP);

  const offsetTop = offset && !isNavHorizontal;

  const [loggedUser, setLoggedUser] = useState<IUser>();

  const [searchAnchor, setSearchAnchor] = useState<HTMLElement | null>(null);

  const [filtersOpen, setFiltersOpen] = useState(false);

  const [getLoggedUser] = useGetLoggedUserMutation();

  const handleGetLoggedUser = useCallback(async () => {
    const result: IUser = await getLoggedUser().unwrap();

    setLoggedUser({
      id: result?.id,
      name: result?.name,
      username: result?.username || '',
      email: result?.email || '',
      phone: result?.phone || '',
      address: result?.address || '',
      firstName: result?.firstName || '',
      surname: result?.surname || '',
      roles: result?.roles,
      businessLocations: result?.businessLocations || [],
    });
  }, [getLoggedUser]);

  useEffect(() => {
    handleGetLoggedUser();
  }, [handleGetLoggedUser]);

  const searchOpen = Boolean(searchAnchor);
  const hasSearchFilter = Boolean(search?.value);

  const renderContent = (
    <>
      {lgUp && isNavHorizontal && <Logo sx={{ mr: 2.5 }} />}

      {!lgUp && (
        <IconButton onClick={onOpenNav}>
          <SvgColor src="/assets/icons/navbar/ic_menu_item.svg" />
        </IconButton>
      )}

      {title && (
        <Typography
          variant="h5"
          noWrap
          sx={{
            ml: !lgUp ? 1 : 0,
            mr: 2,
            flexShrink: 0,
            color: 'text.primary',
            fontWeight: 700,
            lineHeight: 1.3,
          }}
        >
          {title}
        </Typography>
      )}

      <Stack
        flexGrow={1}
        direction="row"
        alignItems="center"
        justifyContent="flex-end"
        spacing={{ xs: 0.5, sm: 1 }}
        sx={{ minWidth: 0 }}
      >
        {filters && (
          <IconButton
            color={filtersActive || filtersOpen ? 'primary' : 'default'}
            onClick={() => setFiltersOpen(true)}
            aria-label="Filtros"
          >
            <Badge color="error" variant="dot" invisible={!filtersActive}>
              <Iconify icon="ic:round-filter-list" />
            </Badge>
          </IconButton>
        )}

        {search && (
          <>
            <IconButton
              color={hasSearchFilter || searchOpen ? 'primary' : 'default'}
              onClick={(event) => setSearchAnchor(event.currentTarget)}
            >
              <Badge color="error" variant="dot" invisible={!hasSearchFilter}>
                <Iconify icon="eva:search-fill" />
              </Badge>
            </IconButton>

            <Popover
              open={searchOpen}
              anchorEl={searchAnchor}
              onClose={() => setSearchAnchor(null)}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              slotProps={{
                paper: {
                  sx: { p: 2, width: 320 },
                },
              }}
            >
              <Stack spacing={1.5}>
                <TextField
                  autoFocus
                  fullWidth
                  size="small"
                  value={search.value}
                  onChange={(event) => search.onChange(event.target.value)}
                  placeholder={search.placeholder || 'Procurar...'}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                      </InputAdornment>
                    ),
                  }}
                />

                {hasSearchFilter && search.onClear && (
                  <Button
                    color="error"
                    size="small"
                    onClick={() => {
                      search.onClear?.();
                      setSearchAnchor(null);
                    }}
                    startIcon={<Iconify icon="eva:trash-2-outline" />}
                  >
                    Limpar
                  </Button>
                )}
              </Stack>
            </Popover>
          </>
        )}

        <TopbarMoreMenu />

        {actions}

        <CompanySwitch loggedUser={loggedUser} />
      </Stack>
    </>
  );

  return (
    <>
      <AppBar
        sx={{
          height: HEADER.H_MOBILE,
          zIndex: theme.zIndex.appBar + 1,
          ...bgBlur({
            color: theme.palette.background.default,
          }),
          transition: theme.transitions.create(['height'], {
            duration: theme.transitions.duration.shorter,
          }),
          ...(lgUp && {
            width: `calc(100% - ${NAV.W_VERTICAL + 1}px)`,
            height: HEADER.H_DESKTOP,
            ...(offsetTop && {
              height: HEADER.H_DESKTOP_OFFSET,
            }),
            ...(isNavHorizontal && {
              width: 1,
              bgcolor: 'background.default',
              height: HEADER.H_DESKTOP_OFFSET,
              borderBottom: `dashed 1px ${theme.palette.divider}`,
            }),
            ...(isNavMini && {
              width: `calc(100% - ${NAV.W_MINI + 1}px)`,
            }),
          }),
        }}
      >
        <Toolbar
          sx={{
            height: 1,
            px: { lg: 5 },
          }}
        >
          {renderContent}
        </Toolbar>
      </AppBar>

      {filters && (
        <FiltersDrawer
          open={filtersOpen}
          onClose={() => setFiltersOpen(false)}
          filtersActive={filtersActive}
          onResetFilters={onResetFilters}
        >
          {filters}
        </FiltersDrawer>
      )}
    </>
  );
}
