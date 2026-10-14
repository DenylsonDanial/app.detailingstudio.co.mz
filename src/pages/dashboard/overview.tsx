import { Helmet } from 'react-helmet-async';
// @mui
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
// config
import { APP_NAME } from 'src/config-global';
import { NAV_CHROME } from 'src/layouts/config-layout';
// components
import Iconify from 'src/components/iconify';
import { useSettingsContext } from 'src/components/settings';
import { usePageHeader } from 'src/layouts/dashboard/page-header-context';

// ----------------------------------------------------------------------

/**
 * Painel inicial. Os cartoes ficam com valores a zero ate os modulos de negocio
 * exporem os respectivos endpoints de resumo (especificacao, seccao 8: indicadores).
 */
const SUMMARY_CARDS = [
  { label: 'Viaturas atendidas hoje', icon: 'solar:wheel-bold-duotone' },
  { label: 'Serviços registados', icon: 'solar:clipboard-list-bold-duotone' },
  { label: 'Recebimentos do dia', icon: 'solar:wallet-money-bold-duotone' },
  { label: 'Dívida total actual', icon: 'solar:bill-list-bold-duotone' },
];

export default function OverviewPage() {
  const settings = useSettingsContext();

  usePageHeader({
    title: 'Resumo',
  });

  return (
    <>
      <Helmet>
        <title>Resumo | {APP_NAME}</title>
      </Helmet>

      <Container maxWidth={settings.themeStretch ? false : 'xl'}>
        <Grid container spacing={3}>
          {SUMMARY_CARDS.map((card) => (
            <Grid key={card.label} xs={12} sm={6} md={3}>
              <Card
                sx={{
                  bgcolor: NAV_CHROME.bgcolor,
                  border: `1px solid ${NAV_CHROME.borderColor}`,
                  boxShadow: 'none',
                }}
              >
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Iconify icon={card.icon} width={40} sx={{ color: 'common.white' }} />
                    <Stack>
                      <Typography variant="h4" sx={{ color: 'common.white' }}>
                        —
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.72)' }}>
                        {card.label}
                      </Typography>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </>
  );
}
