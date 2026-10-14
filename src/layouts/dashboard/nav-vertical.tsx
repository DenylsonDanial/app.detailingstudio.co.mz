import { useCallback, useEffect, useState } from 'react';
// @mui
import Stack from '@mui/material/Stack';
import Drawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
// hooks
import { useResponsive } from 'src/hooks/use-responsive';
// components
import Logo from 'src/components/logo';
import Scrollbar from 'src/components/scrollbar';
import { usePathname } from 'src/routes/hook';
import { NavSectionVertical } from 'src/components/nav-section';
//
import { NAV, NAV_CHROME } from '../config-layout';
import { useNavData } from './config-navigation';
import { NavAccount, NavToggleButton } from '../_common';
import { IUser } from '../../types/user';
import { useGetLoggedUserMutation } from '../../redux/services/userService';

// ----------------------------------------------------------------------

type Props = {
  openNav: boolean;
  onCloseNav: VoidFunction;
};

export default function NavVertical({ openNav, onCloseNav }: Props) {
  const pathname = usePathname();

  const lgUp = useResponsive('up', 'lg');

  const navData = useNavData();

  const [loggedUser, setLoggedUser] = useState<IUser>();

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
      photo: result?.photo,
      roles: result?.roles,
      businessLocations: result?.businessLocations || [],
    });
  }, [getLoggedUser]);

  useEffect(() => {
    handleGetLoggedUser();
  }, [handleGetLoggedUser]);

  useEffect(() => {
    if (openNav) {
      onCloseNav();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const renderFooter = (
    <Stack
      direction="row"
      alignItems="center"
      sx={{
        flexShrink: 0,
        px: 2,
        py: 2,
        borderTop: `solid 1px ${NAV_CHROME.borderColor}`,
      }}
    >
      <NavAccount loggedUser={loggedUser} />
    </Stack>
  );

  const renderContent = (
    <>
      <Logo
        appearance="onDark"
        sx={{ flexShrink: 0, mt: 3, ml: 3, mb: 1, width: 200, height: 50 }}
      />

      <Scrollbar
        sx={{
          flex: '1 1 auto',
          minHeight: 0,
          '& .simplebar-content': {
            display: 'flex',
            flexDirection: 'column',
          },
        }}
      >
        <NavSectionVertical data={navData} />
      </Scrollbar>

      {renderFooter}
    </>
  );

  const chromeSx = {
    bgcolor: NAV_CHROME.bgcolor,
    borderRight: `solid 1px ${NAV_CHROME.borderColor}`,
    color: 'primary.lighter',
  };

  return (
    <Box
      component="nav"
      sx={{
        flexShrink: { lg: 0 },
        width: { lg: NAV.W_VERTICAL },
      }}
    >
      <NavToggleButton />

      {lgUp ? (
        <Stack
          sx={{
            height: 1,
            position: 'fixed',
            width: NAV.W_VERTICAL,
            ...chromeSx,
          }}
        >
          {renderContent}
        </Stack>
      ) : (
        <Drawer
          open={openNav}
          onClose={onCloseNav}
          PaperProps={{
            sx: {
              width: NAV.W_VERTICAL,
              ...chromeSx,
            },
          }}
        >
          {renderContent}
        </Drawer>
      )}
    </Box>
  );
}
