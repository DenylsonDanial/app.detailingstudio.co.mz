import { Helmet } from 'react-helmet-async';
import { useNavigate, useParams } from 'react-router-dom';
// @mui
import { Button, Container } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import RoleNewEditForm from '../../sections/role/RoleNewEditForm';
import { useSettingsContext } from '../../components/settings';
import { IRole, IRoleCreate } from '../../types/role';
import { useGetRoleMutation } from '../../redux/services/roleService';
import Iconify from '../../components/iconify';
import { usePageHeader } from '../../layouts/dashboard/page-header-context';

// ----------------------------------------------------------------------

export default function Roleedit() {
  const { themeStretch } = useSettingsContext();

  const [currentRole, setCurrentRole] = useState<IRoleCreate>();

  const [getRole] = useGetRoleMutation();

  const { id } = useParams();

  const navigate = useNavigate();

  usePageHeader({
    title: 'Editar cargo',
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

  const handleGetRole = useCallback(
    async (roleId: number) => {
      const result: IRole = await getRole(roleId).unwrap();
      const rolesList: number[] = [];
      result?.permissions.forEach((item) => {
        if (item.id) rolesList.push(item.id);
      });
      setCurrentRole({ ...result, permissions: rolesList });
    },
    [getRole]
  );

  useEffect(() => {
    if (id) handleGetRole(+id);
  }, [handleGetRole, id]);

  return (
    <>
      <Helmet>
        <title> Cargos - Editar | IHapari</title>
      </Helmet>

      <Container maxWidth={themeStretch ? false : 'lg'}>
        <RoleNewEditForm isEdit currentRole={currentRole} />
      </Container>
    </>
  );
}
