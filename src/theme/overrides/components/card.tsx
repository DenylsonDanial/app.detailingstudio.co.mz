import { alpha, Theme } from '@mui/material/styles';

// ----------------------------------------------------------------------

export default function Card(theme: Theme) {
  return {
    MuiCard: {
      styleOverrides: {
        root: {
          position: 'relative',
          boxShadow: theme.customShadows.card,
          borderRadius: theme.shape.borderRadius * 1.5,
          zIndex: 0, // Fix Safari overflow: hidden with border radius
          transition: theme.transitions.create(['box-shadow', 'transform'], {
            duration: theme.transitions.duration.shorter,
          }),
          ...(theme.palette.mode === 'dark' && {
            border: `1px solid ${alpha(theme.palette.common.white, 0.16)}`,
          }),
          '&:hover': {
            boxShadow: theme.customShadows.z8,
          },
        },
      },
    },
    MuiCardHeader: {
      defaultProps: {
        titleTypographyProps: { variant: 'h6' },
        subheaderTypographyProps: { variant: 'body2', marginTop: theme.spacing(0.5) },
      },
      styleOverrides: {
        root: {
          padding: theme.spacing(3, 3, 0),
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: theme.spacing(3),
        },
      },
    },
  };
}
