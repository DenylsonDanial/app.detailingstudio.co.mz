import { m } from 'framer-motion';
// @mui
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
// routes
import { RouterLink } from 'src/routes/components';
// components
import { MotionContainer, varBounce } from 'src/components/animate';
// assets
import { PageNotFoundIllustration } from 'src/assets/illustrations';

// ----------------------------------------------------------------------

export default function NotFoundView() {
  return (
    <MotionContainer
      sx={{
        m: 'auto',
        maxWidth: 480,
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        flexGrow: 1,
        py: { xs: 5, md: 10 },
      }}
    >
      <m.div variants={varBounce().in}>
        <Typography variant="h3" paragraph>
          Página não encontrada
        </Typography>
      </m.div>

      <m.div variants={varBounce().in}>
        <Typography sx={{ color: 'text.secondary' }}>
          Não encontrámos a página que procura. Verifique se o URL está correcto.
        </Typography>
      </m.div>

      <m.div variants={varBounce().in}>
        <PageNotFoundIllustration
          sx={{
            height: 260,
            my: { xs: 5, sm: 10 },
          }}
        />
      </m.div>

      <Button component={RouterLink} href="/" size="large" variant="contained">
        Ir para o início
      </Button>
    </MotionContainer>
  );
}
