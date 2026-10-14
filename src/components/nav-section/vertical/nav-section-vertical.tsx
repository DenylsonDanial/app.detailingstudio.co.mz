import { memo, useState, useCallback } from 'react';
// @mui
import List from '@mui/material/List';
import Stack from '@mui/material/Stack';
import Collapse from '@mui/material/Collapse';
//
import { hasPermission } from 'src/auth/context/jwt/utils';
import Iconify from 'src/components/iconify';
import { NavSectionProps, NavListProps, NavConfigProps } from '../types';
import { navVerticalConfig } from '../config';
import { StyledSubheader } from './styles';

import NavList from './nav-list';

// ----------------------------------------------------------------------

const NAV_GROUP_COLLAPSE_KEY = 'nav-group-collapse';

type CollapseMap = Record<string, boolean>;

function readCollapseMap(): CollapseMap {
  try {
    const raw = localStorage.getItem(NAV_GROUP_COLLAPSE_KEY);
    if (!raw) {
      return {};
    }
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function writeCollapseState(subheader: string, open: boolean) {
  try {
    const map = readCollapseMap();
    map[subheader] = open;
    localStorage.setItem(NAV_GROUP_COLLAPSE_KEY, JSON.stringify(map));
  } catch {
    // ignore quota / private mode
  }
}

function getInitialOpen(subheader: string): boolean {
  const stored = readCollapseMap()[subheader];
  return typeof stored === 'boolean' ? stored : true;
}

function isNavItemVisible(item: NavListProps): boolean {
  return !item.roles?.length || hasPermission(item.roles);
}

function NavSectionVertical({ data, config, sx, ...other }: NavSectionProps) {
  return (
    <Stack sx={sx} {...other}>
      {data.map((group, index) => (
        <Group
          key={group.subheader || index}
          subheader={group.subheader}
          items={group.items}
          config={navVerticalConfig(config)}
        />
      ))}
    </Stack>
  );
}

export default memo(NavSectionVertical);

// ----------------------------------------------------------------------

type GroupProps = {
  subheader: string;
  items: NavListProps[];
  config: NavConfigProps;
};

function Group({ subheader, items, config }: GroupProps) {
  const [open, setOpen] = useState(() => (subheader ? getInitialOpen(subheader) : true));

  const handleToggle = useCallback(() => {
    setOpen((prev) => {
      const next = !prev;
      if (subheader) {
        writeCollapseState(subheader, next);
      }
      return next;
    });
  }, [subheader]);

  // Esconde o titulo do modulo quando o utilizador nao tem acesso a nenhum item.
  const visibleItems = items.filter(isNavItemVisible);

  if (!visibleItems.length) {
    return null;
  }

  const renderContent = visibleItems.map((list) => (
    <NavList
      key={list.title + list.path}
      data={list}
      depth={1}
      hasChild={!!list.children}
      config={config}
    />
  ));

  return (
    <List disablePadding sx={{ px: 2 }}>
      {subheader ? (
        <>
          <StyledSubheader
            disableGutters
            disableSticky
            onClick={handleToggle}
            config={config}
            aria-expanded={open}
          >
            {subheader}
            <Iconify
              width={16}
              icon={open ? 'eva:arrow-ios-downward-fill' : 'eva:arrow-ios-forward-fill'}
              sx={{ flexShrink: 0, ml: 1 }}
            />
          </StyledSubheader>

          <Collapse in={open}>{renderContent}</Collapse>
        </>
      ) : (
        renderContent
      )}
    </List>
  );
}
