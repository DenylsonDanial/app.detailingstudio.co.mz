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
  /**
   * `onLight` — tinta escura para fundos claros.
   * `onDark` — tinta clara para fundos escuros.
   * `auto` — segue o mode do tema.
   */
  appearance?: 'auto' | 'onLight' | 'onDark';
  /** Versão compacta (ícone DS) para menu fechado / splash / favicon. */
  compact?: boolean;
}

const LOGO = {
  full: {
    light: '/logo/full_logo_light.png',
    dark: '/logo/full_logo_dark.png',
  },
  icon: {
    light: '/logo/icon_light.png',
    dark: '/logo/icon_dark.png',
  },
} as const;

const Logo = forwardRef<HTMLDivElement, LogoProps>(
  ({ disabledLink = false, appearance = 'auto', compact = false, sx, ...other }, ref) => {
    const theme = useTheme();

    const useDarkVariant =
      appearance === 'onDark' || (appearance === 'auto' && theme.palette.mode === 'dark');

    const variants = compact ? LOGO.icon : LOGO.full;
    const src = useDarkVariant ? variants.dark : variants.light;

    const logo = (
      <Box
        ref={ref}
        component="img"
        src={src}
        alt="Detailing Studio"
        sx={{
          width: compact ? 40 : 110,
          height: compact ? 40 : 78,
          objectFit: 'contain',
          objectPosition: 'left center',
          cursor: 'pointer',
          display: 'inline-flex',
          transition: 'transform 0.2s ease-in-out',
          '&:hover': {
            transform: 'scale(1.03)',
          },
          ...sx,
        }}
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

export default Logo;
