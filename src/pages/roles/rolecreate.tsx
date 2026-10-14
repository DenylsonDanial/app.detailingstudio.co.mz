import { Helmet } from 'react-helmet-async';
// @mui
import { Button, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useSettingsContext } from '../../components/settings';
import Iconify from '../../components/iconify';
import RoleNewEditForm from '../../sections/role/RoleNewEditForm';
import { usePageHeader } from '../../layouts/dashboard/page-header-context';

// ----------------------------------------------------------------------

export default function Page() {
  const { themeStretch } = useSettingsContext();

  const navigate = useNavigate();

  usePageHeader({
    title: 'Adicionar novo cargo',
    actions: (
      <Button
        onClick={() => navigate(-1)}
        variant="soft"
        color="secondary"
        startIcon={<Iconify icon="eva:arrow-back-fill" />}
      >
        Voltar
      </Button>
    ),
  });

  return (
    <>
      <Helmet>
        <title> Cargo | Adicionar novo</title>
      </Helmet>

      <Container maxWidth={themeStretch ? false : 'lg'}>
        <RoleNewEditForm />
      </Container>
    </>
  );
}
