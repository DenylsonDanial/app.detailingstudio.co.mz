import { Theme } from '@mui/material/styles';
import { tabClasses } from '@mui/material/Tab';

// ----------------------------------------------------------------------

export default function Tabs(theme: Theme) {
  return {
    MuiTabs: {
      defaultProps: {
        textColor: 'inherit',
        variant: 'scrollable',
        allowScrollButtonsMobile: true,
      },
      styleOverrides: {
        indicator: {
          backgroundColor: theme.palette.text.primary,
          height: 3,
          borderRadius: 3,
        },
        scrollButtons: {
          width: 48,
          borderRadius: '50%',
        },
      },
    },
    MuiTab: {
      defaultProps: {
        disableRipple: true,
        iconPosition: 'start',
      },
      styleOverrides: {
        root: {
          padding: 0,
          opacity: 1,
          minWidth: 48,
          minHeight: 48,
          fontWeight: theme.typography.fontWeightSemiBold,
          transition: theme.transitions.create(['color', 'background-color'], {
            duration: theme.transitions.duration.short,
          }),
          '&:not(:last-of-type)': {
            marginRight: theme.spacing(3),
            [theme.breakpoints.up('sm')]: {
              marginRight: theme.spacing(5),
            },
          },
          [`&:not(.${tabClasses.selected})`]: {
            color: theme.palette.text.secondary,
          },
          [`&.${tabClasses.selected}`]: {
            fontWeight: theme.typography.fontWeightBold,
          },
        },
      },
    },
  };
}
