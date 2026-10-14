import { useCallback, useEffect, useState } from 'react';
// @mui
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
// theme
import { hideScroll } from 'src/theme/css';
// components
import Logo from 'src/components/logo';
import { NavSectionMini } from 'src/components/nav-section';
//
import { NAV, NAV_CHROME } from '../config-layout';
import { useNavData } from './config-navigation';
import { NavAccount, NavToggleButton } from '../_common';
import { IUser } from '../../types/user';
import { useGetLoggedUserMutation } from '../../redux/services/userService';

// ----------------------------------------------------------------------

export default function NavMini() {
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

  return (
    <Box
      component="nav"
      sx={{
        flexShrink: { lg: 0 },
        width: { lg: NAV.W_MINI },
      }}
    >
      <NavToggleButton
        sx={{
          top: 22,
          left: NAV.W_MINI - 12,
        }}
      />

      <Stack
        sx={{
          height: 1,
          position: 'fixed',
          width: NAV.W_MINI,
          bgcolor: NAV_CHROME.bgcolor,
          borderRight: `solid 1px ${NAV_CHROME.borderColor}`,
          color: 'primary.lighter',
          ...hideScroll.x,
        }}
      >
        <Logo appearance="onDark" compact sx={{ flexShrink: 0, mx: 'auto', my: 2 }} />

        <Box sx={{ flex: '1 1 auto', minHeight: 0, overflowY: 'auto', pb: 2, ...hideScroll.x }}>
          <NavSectionMini data={navData} />
        </Box>

        <Stack
          alignItems="center"
          sx={{
            flexShrink: 0,
            py: 2,
            borderTop: `solid 1px ${NAV_CHROME.borderColor}`,
          }}
        >
          <NavAccount loggedUser={loggedUser} compact />
        </Stack>
      </Stack>
    </Box>
  );
}
