import { Helmet } from 'react-helmet-async';
import React, { useCallback, useState } from 'react';
// @mui
import { Card, Container, Tabs, Tab } from '@mui/material';
import Iconify from '../../components/iconify';
import { useSettingsContext } from '../../components/settings';
import GeneralSetting from './components/general';
import BusinessSetting from './components/business';
import { usePageHeader } from '../../layouts/dashboard/page-header-context';

// sections

const TABS = [
  {
    value: 'general',
    label: 'Geral',
    icon: <Iconify icon="solar:settings-minimalistic-linear" width={24} />,
  },
  {
    value: 'business',
    label: 'Negócio',
    icon: <Iconify icon="solar:money-bag-broken" width={24} />,
  },
];
// ----------------------------------------------------------------------

export default function Page() {
  const [currentTab, setCurrentTab] = useState('general');

  const handleChangeTab = useCallback((event: React.SyntheticEvent, newValue: string) => {
    setCurrentTab(newValue);
  }, []);

  const { themeStretch } = useSettingsContext();

  usePageHeader({
    title: 'Definições do sistema',
  });

  return (
    <>
      <Helmet>
        <title>Definições</title>
      </Helmet>

      <Container maxWidth={themeStretch ? false : 'xl'}>
        <Card sx={{ padding: 2 }}>
          <Tabs
            value={currentTab}
            onChange={handleChangeTab}
            sx={{
              mb: { xs: 3, md: 5 },
            }}
          >
            {TABS.map((tab) => (
              <Tab key={tab.value} label={tab.label} icon={tab.icon} value={tab.value} />
            ))}
          </Tabs>

          {currentTab === 'general' && <GeneralSetting />}

          {currentTab === 'business' && <BusinessSetting />}
        </Card>
      </Container>
    </>
  );
}
