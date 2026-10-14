import { m } from 'framer-motion';
// @mui
import { SxProps, Theme } from '@mui/material/styles';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
// assets
import { ForbiddenIllustration } from 'src/assets/illustrations';
// components
import { MotionContainer, varBounce } from 'src/components/animate';
//
import { hasPermission } from '../context/jwt/utils';

// ----------------------------------------------------------------------

type RoleBasedGuardProp = {
  /** Mostra o ecra de acesso negado em vez de nao renderizar nada. */
  hasContent?: boolean;
  /** Permissoes ou perfis aceites; basta ter um deles. */
  permissions?: string[];
  children: React.ReactNode;
  sx?: SxProps<Theme>;
};

/**
 * Esconde conteudo a quem nao tem permissao. E apenas uma barreira de interface:
 * a autorizacao efectiva e sempre a do servidor (@PreAuthorize).
 */
export default function RoleBasedGuard({
  hasContent,
  permissions,
  children,
  sx,
}: RoleBasedGuardProp) {
  const allowed = !permissions?.length || hasPermission(permissions);

  if (!allowed) {
    return hasContent ? (
      <Container component={MotionContainer} sx={{ textAlign: 'center', ...sx }}>
        <m.div variants={varBounce().in}>
          <Typography variant="h3" paragraph>
            Permissão negada
          </Typography>
        </m.div>

        <m.div variants={varBounce().in}>
          <Typography sx={{ color: 'text.secondary' }}>
            Não possui permissão para aceder a este recurso.
          </Typography>
        </m.div>

        <m.div variants={varBounce().in}>
          <ForbiddenIllustration sx={{ height: 260, my: { xs: 5, sm: 10 } }} />
        </m.div>
      </Container>
    ) : null;
  }

  return <>{children}</>;
}
