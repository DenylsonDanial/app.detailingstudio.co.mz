import { Theme, alpha } from '@mui/material/styles';

// ----------------------------------------------------------------------

export default function Paper(theme: Theme) {
  return {
    MuiPaper: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          transition: theme.transitions.create(['box-shadow'], {
            duration: theme.transitions.duration.shorter,
          }),
        },
        outlined: {
          borderColor: alpha(theme.palette.grey[500], 0.12),
          borderWidth: 1.5,
        },
        elevation1: {
          boxShadow: theme.customShadows.z1,
        },
        elevation2: {
          boxShadow: theme.customShadows.z4,
        },
        elevation3: {
          boxShadow: theme.customShadows.z8,
        },
      },
    },
  };
}
