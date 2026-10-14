// @mui
import { alpha, styled } from '@mui/material/styles';
import ListItemIcon from '@mui/material/ListItemIcon';
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
})<StyledItemProps>(({ active, open, depth, config, theme }) => {
  const subItem = depth !== 1;

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
      backgroundColor: alpha(theme.palette.common.white, 0.12),
      '&:hover': {
        backgroundColor: alpha(theme.palette.common.white, 0.16),
      },
    },
  };

  return {
    // Root item
    flexDirection: 'column',
    justifyContent: 'center',
    borderRadius: config.itemRadius,
    minHeight: config.itemRootHeight,
    color: idleColor,
    margin: `0 ${config.itemGap}px ${config.itemGap}px ${config.itemGap}px`,
    '&:hover': {
      backgroundColor: alpha(theme.palette.common.white, 0.08),
    },
    ...(config.hiddenLabel &&
      !subItem && {
        padding: config.itemPadding,
      }),

    // Active root item
    ...(active && {
      ...activeStyles.root,
    }),

    // Sub item
    ...(subItem && {
      margin: 0,
      flexDirection: 'row',
      padding: theme.spacing(0, 1),
      minHeight: config.itemSubHeight,
      // Active sub item
      ...(active && {
        ...activeStyles.sub,
      }),
    }),

    // Open
    ...(open &&
      !active && {
        color: activeColor,
        backgroundColor: alpha(theme.palette.common.white, 0.08),
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
  marginRight: 0,
  color: 'inherit',
}));
