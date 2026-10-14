// @mui
import { alpha, styled } from '@mui/material/styles';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListSubheader from '@mui/material/ListSubheader';
import ListItemButton from '@mui/material/ListItemButton';
//
import { NavItemProps, NavConfigProps } from '../types';

// ----------------------------------------------------------------------
// Cores da sidebar always-dark (nao dependem do mode light/dark do conteudo).

type StyledItemProps = Omit<NavItemProps, 'item'> & {
  config: NavConfigProps;
};

export const StyledItem = styled(ListItemButton, {
  shouldForwardProp: (prop) => prop !== 'active',
})<StyledItemProps>(({ active, depth, config, theme }) => {
  const subItem = depth !== 1;

  const deepSubItem = depth > 2;

  const idleColor = alpha(theme.palette.common.white, 0.88);
  const activeColor = theme.palette.common.white;

  const activeStyles = {
    root: {
      color: activeColor,
      backgroundColor: alpha(theme.palette.common.white, 0.14),
      '&:hover': {
        backgroundColor: alpha(theme.palette.common.white, 0.2),
      },
    },
    sub: {
      color: activeColor,
      backgroundColor: 'transparent',
      '&:hover': {
        backgroundColor: alpha(theme.palette.common.white, 0.1),
      },
    },
  };

  return {
    // Root item
    padding: config.itemPadding,
    marginBottom: config.itemGap,
    borderRadius: config.itemRadius,
    minHeight: config.itemRootHeight,
    color: idleColor,
    '&:hover': {
      backgroundColor: alpha(theme.palette.common.white, 0.08),
    },

    // Active root item
    ...(active && {
      ...activeStyles.root,
    }),

    // Sub item
    ...(subItem && {
      minHeight: config.itemSubHeight,
      // Active sub item
      ...(active && {
        ...activeStyles.sub,
      }),
    }),

    // Deep sub item
    ...(deepSubItem && {
      paddingLeft: theme.spacing(depth),
    }),
  };
});

// ----------------------------------------------------------------------

type StyledIconProps = {
  size?: number;
};

export const StyledIcon = styled(ListItemIcon)<StyledIconProps>(({ size }) => ({
  width: size,
  height: size,
  alignItems: 'center',
  justifyContent: 'center',
  color: 'inherit',
}));

type StyledDotIconProps = {
  active?: boolean;
};

export const StyledDotIcon = styled('span')<StyledDotIconProps>(({ active, theme }) => ({
  width: 4,
  height: 4,
  borderRadius: '50%',
  backgroundColor: alpha(theme.palette.common.white, 0.48),
  transition: theme.transitions.create(['transform'], {
    duration: theme.transitions.duration.shorter,
  }),
  ...(active && {
    transform: 'scale(2)',
    backgroundColor: theme.palette.common.white,
  }),
}));

// ----------------------------------------------------------------------

type StyledSubheaderProps = {
  config: NavConfigProps;
};

export const StyledSubheader = styled(ListSubheader)<StyledSubheaderProps>(({ config, theme }) => ({
  ...theme.typography.overline,
  fontSize: 11,
  cursor: 'pointer',
  width: '100%',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: config.itemPadding,
  paddingTop: theme.spacing(2),
  marginBottom: config.itemGap,
  paddingBottom: theme.spacing(1),
  color: alpha(theme.palette.common.white, 0.64),
  backgroundColor: 'transparent',
  transition: theme.transitions.create(['color'], {
    duration: theme.transitions.duration.shortest,
  }),
  '&:hover': {
    color: theme.palette.common.white,
  },
}));
