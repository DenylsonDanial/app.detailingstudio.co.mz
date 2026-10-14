import { forwardRef } from 'react';
// @mui
import { useTheme } from '@mui/material/styles';
import Link from '@mui/material/Link';
import Box, { BoxProps } from '@mui/material/Box';
// routes
import { RouterLink } from 'src/routes/components';

// ----------------------------------------------------------------------

export interface LogoProps extends BoxProps {
  disabledLink?: boolean;
}

const LogoHome = forwardRef<HTMLDivElement, LogoProps>(
  ({ disabledLink = false, sx, ...other }, ref) => {
    const theme = useTheme();

    const src =
      theme.palette.mode === 'dark' ? '/logo/full_logo_dark.png' : '/logo/full_logo_light.png';

    const logo = (
      <Box
        ref={ref}
        component="img"
        src={src}
        alt="Detailing Studio"
        sx={{ width: 140, height: 99, objectFit: 'contain', cursor: 'pointer', ...sx }}
        {...other}
      />
    );

    if (disabledLink) {
      return logo;
    }

    return (
      <Link component={RouterLink} href="/" sx={{ display: 'contents' }}>
        {logo}
      </Link>
    );
  }
);

export default LogoHome;
