import { Theme } from '@mui/material/styles';
import { DialogProps } from '@mui/material/Dialog';

// ----------------------------------------------------------------------

export default function Dialog(theme: Theme) {
  return {
    MuiDialog: {
      styleOverrides: {
        paper: ({ ownerState }: { ownerState: DialogProps }) => ({
          boxShadow: theme.customShadows.dialog,
          borderRadius: theme.shape.borderRadius * 2,
          backdropFilter: 'blur(10px)',
          ...(!ownerState.fullScreen && {
            margin: theme.spacing(2),
          }),
        }),
        paperFullScreen: {
          borderRadius: 0,
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          padding: theme.spacing(3),
          fontWeight: 700,
        },
      },
    },
    MuiDialogContent: {
      styleOverrides: {
        root: {
          padding: theme.spacing(0, 3),
        },
        dividers: {
          borderTop: 0,
          borderBottomStyle: 'dashed',
          paddingBottom: theme.spacing(3),
        },
      },
    },
    MuiDialogActions: {
      defaultProps: {
        disableSpacing: true,
      },
      styleOverrides: {
        root: {
          padding: theme.spacing(3),
          gap: theme.spacing(1.5),
          '& > :not(:first-of-type)': {
            marginLeft: 0,
          },
        },
      },
    },
  };
}
