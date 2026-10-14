import { Helmet } from 'react-helmet-async';
import { useNavigate, useParams } from 'react-router-dom';
// @mui
import { Button, Container } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import { useSettingsContext } from '../../components/settings';
import { IUser, IUserCreate } from '../../types/user';
import { useGetUserMutation } from '../../redux/services/userService';
import Iconify from '../../components/iconify';
import UserNewEditForm from '../../sections/user/UserNewEditForm';
import { usePageHeader } from '../../layouts/dashboard/page-header-context';

// ----------------------------------------------------------------------

export default function UserEdit() {
  const { themeStretch } = useSettingsContext();

  const [currentUser, setCurrentUser] = useState<IUserCreate>();

  const [getUser] = useGetUserMutation();

  const { id } = useParams();

  const navigate = useNavigate();

  usePageHeader({
    title: 'Editar utilizador',
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

  const handleGetUser = useCallback(
    async (userId: number) => {
      const result: IUser = await getUser(userId).unwrap();
      const rolesList: number[] = [];
      result?.roles?.forEach((item) => {
        if (item.id) rolesList.push(item.id);
      });

      const tenantsList: number[] = [];
      result?.businessLocations?.forEach((item) => {
        if (item.id) tenantsList.push(item.id);
      });

      setCurrentUser({
        id: result?.id,
        username: result?.username || '',
        email: result?.email || '',
        phone: result?.phone || '',
        address: result?.address || '',
        firstName: result?.firstName || '',
        surname: result?.surname || '',
        roles: result?.roles,
        isVerified: true,
        rolesIds: rolesList,
        businessLocations: result?.businessLocations || [],
        locationsIds: tenantsList,
      });
    },
    [getUser]
  );

  useEffect(() => {
    if (id) handleGetUser(+id);
  }, [handleGetUser, id]);

  return (
    <>
      <Helmet>
        <title> Utilizador - Editar | IHapari</title>
      </Helmet>

      <Container maxWidth={themeStretch ? false : 'lg'}>
        {currentUser && <UserNewEditForm isEdit currentUser={currentUser} />}
      </Container>
    </>
  );
}
