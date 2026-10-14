// @mui
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
// hooks
import { useResponsive } from 'src/hooks/use-responsive';
// components
import Logo from 'src/components/logo';

// ----------------------------------------------------------------------

type Props = {
  title?: string;
  image?: string;
  children: React.ReactNode;
};

/**
 * Ecra de autenticacao com a linguagem do site detailingstudio.co.mz: painel
 * preto com o logotipo graffiti e o slogan, formulario sobre fundo claro.
 */
export default function AuthClassicLayout({ children, image, title }: Props) {
  const upMd = useResponsive('up', 'md');

  const renderMobileLogo = (
    <Logo
      disabledLink
      appearance="onLight"
      sx={{ width: 150, height: 106, mb: 5, alignSelf: 'center', objectPosition: 'center' }}
    />
  );

  const renderContent = (
    <Stack
      sx={{
        width: 1,
        mx: 'auto',
        maxWidth: 480,
        px: { xs: 2, md: 8 },
        py: { xs: 6, md: 30 },
      }}
    >
      {!upMd && renderMobileLogo}
      {children}
    </Stack>
  );

  const renderSection = (
    <Stack
      flexGrow={1}
      alignItems="center"
      justifyContent="center"
      spacing={5}
      sx={{
        px: 6,
        position: 'relative',
        overflow: 'hidden',
        bgcolor: 'common.black',
        color: 'common.white',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: 8,
          bgcolor: 'primary.main',
        }}
      />

      <Box
        component="img"
        alt="Detailing Studio"
        src={image || '/logo/full_logo_dark.png'}
        sx={{ width: 1, maxWidth: 380, objectFit: 'contain' }}
      />

      <Stack spacing={1.5} alignItems="center" sx={{ maxWidth: 520, textAlign: 'center' }}>
        <Typography variant="h3" sx={{ color: 'common.white' }}>
          {title || 'Cuidado de verdade.'}
        </Typography>
        <Typography variant="h3" sx={{ color: 'primary.main' }}>
          Detalhe que grita.
        </Typography>
        <Typography variant="body2" sx={{ color: 'grey.500', pt: 1 }}>
          Sistema de gestão: entradas, serviços, pagamentos e conta corrente.
        </Typography>
      </Stack>
    </Stack>
  );

  return (
    <Stack
      component="main"
      direction="row"
      sx={{
        minHeight: '100vh',
        maxHeight: '100vh',
      }}
    >
      {upMd && renderSection}

      {renderContent}
    </Stack>
  );
}
