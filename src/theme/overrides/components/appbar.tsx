import { Theme } from '@mui/material/styles';

// ----------------------------------------------------------------------

export default function AppBar(theme: Theme) {
  return {
    MuiAppBar: {
      defaultProps: {
        color: 'transparent',
      },

      styleOverrides: {
        root: {
          boxShadow: 'none',
          backdropFilter: 'blur(20px)',
          backgroundColor: theme.palette.mode === 'light' 
            ? 'rgba(255, 255, 255, 0.8)' 
            : 'rgba(15, 23, 42, 0.8)',
        },
      },
    },
  };
}
