import { alpha, Theme } from '@mui/material/styles';
import { ButtonProps, buttonClasses } from '@mui/material/Button';

// ----------------------------------------------------------------------

const COLORS = ['primary', 'secondary', 'info', 'success', 'warning', 'error'] as const;

// NEW VARIANT
declare module '@mui/material/Button' {
  interface ButtonPropsVariantOverrides {
    soft: true;
  }
}

// ----------------------------------------------------------------------

export default function Button(theme: Theme) {
  const isLight = theme.palette.mode === 'light';

  const rootStyles = (ownerState: ButtonProps) => {
    const inheritColor = ownerState.color === 'inherit';

    const containedVariant = ownerState.variant === 'contained';

    const outlinedVariant = ownerState.variant === 'outlined';

    const textVariant = ownerState.variant === 'text';

    const softVariant = ownerState.variant === 'soft';

    const smallSize = ownerState.size === 'small';

    const mediumSize = ownerState.size === 'medium';

    const largeSize = ownerState.size === 'large';

    const defaultStyle = {
      transition: theme.transitions.create(['background-color', 'box-shadow', 'border-color'], {
        duration: theme.transitions.duration.short,
      }),
      ...(inheritColor && {
        // CONTAINED
        ...(containedVariant && {
          color: isLight ? theme.palette.common.white : theme.palette.grey[800],
          backgroundColor: isLight ? theme.palette.grey[800] : theme.palette.common.white,
          '&:hover': {
            backgroundColor: isLight ? theme.palette.grey[700] : theme.palette.grey[400],
            transform: 'translateY(-2px)',
            boxShadow: theme.customShadows.z8,
          },
        }),
        // OUTLINED
        ...(outlinedVariant && {
          borderColor: alpha(theme.palette.grey[500], 0.32),
          borderWidth: 1.5,
          '&:hover': {
            backgroundColor: theme.palette.action.hover,
            borderColor: theme.palette.grey[500],
          },
        }),
        // TEXT
        ...(textVariant && {
          '&:hover': {
            backgroundColor: theme.palette.action.hover,
          },
        }),
        // SOFT
        ...(softVariant && {
          color: theme.palette.text.primary,
          backgroundColor: alpha(theme.palette.grey[500], 0.08),
          '&:hover': {
            backgroundColor: alpha(theme.palette.grey[500], 0.16),
          },
        }),
      }),
      ...(outlinedVariant && {
        '&:hover': {
          borderColor: 'currentColor',
        },
      }),
    };

    const colorStyle = COLORS.map((color) => ({
      ...(ownerState.color === color && {
        // CONTAINED
        ...(containedVariant && {
          '&:hover': {
            boxShadow: theme.customShadows[color],
            transform: 'translateY(-2px)',
          },
        }),
        // SOFT
        ...(softVariant && {
          color: theme.palette[color][isLight ? 'dark' : 'light'],
          backgroundColor: alpha(theme.palette[color].main, 0.12),
          '&:hover': {
            backgroundColor: alpha(theme.palette[color].main, 0.24),
          },
        }),
      }),
    }));

    const disabledState = {
      [`&.${buttonClasses.disabled}`]: {
        // SOFT
        ...(softVariant && {
          backgroundColor: theme.palette.action.disabledBackground,
        }),
      },
    };

    const size = {
      ...(smallSize && {
        height: 30,
        fontSize: 13,
        paddingLeft: 8,
        paddingRight: 8,
        ...(textVariant && {
          paddingLeft: 4,
          paddingRight: 4,
        }),
      }),
      ...(mediumSize && {
        paddingLeft: 12,
        paddingRight: 12,
        ...(textVariant && {
          paddingLeft: 8,
          paddingRight: 8,
        }),
      }),
      ...(largeSize && {
        height: 48,
        fontSize: 15,
        paddingLeft: 16,
        paddingRight: 16,
        ...(textVariant && {
          paddingLeft: 10,
          paddingRight: 10,
        }),
      }),
    };

    return [defaultStyle, ...colorStyle, disabledState, size];
  };

  return {
    MuiButton: {
      defaultProps: {
        color: 'inherit',
        disableElevation: true,
      },

      styleOverrides: {
        root: ({ ownerState }: { ownerState: ButtonProps }) => rootStyles(ownerState),
      },
    },
  };
}
