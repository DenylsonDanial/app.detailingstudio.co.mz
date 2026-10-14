import { useMemo } from 'react';
// routes
import { paths } from 'src/routes/paths';
// components
import Iconify from 'src/components/iconify';
//
import { Authorities } from 'src/utils/authorities';

// ----------------------------------------------------------------------

const icon = (name: string) => <Iconify icon={name} sx={{ width: 1, height: 1 }} />;

const ICONS = {
  dashboard: icon('solar:widget-5-bold-duotone'),
  users: icon('solar:user-id-bold-duotone'),
  audit: icon('solar:shield-keyhole-bold-duotone'),
  settings: icon('solar:settings-bold-duotone'),
  companies: icon('solar:buildings-3-bold-duotone'),
};

// ----------------------------------------------------------------------

/**
 * Estrutura de navegacao. Cada entrada declara em `roles` as permissoes que dao
 * acesso ao item: basta uma para o item aparecer. O catalogo de permissoes esta
 * em src/utils/authorities.ts e tem de coincidir com o seed do backend.
 *
 * As areas de negocio da especificacao (Operacao diaria, Clientes e contas,
 * Despesas, Servicos e precos, Relatorios) entram aqui a medida que cada modulo
 * ganha paginas, para o menu nunca apontar para rotas inexistentes.
 */
export function useNavData() {
  return useMemo(
    () => [
      {
        subheader: 'Geral',
        items: [
          {
            title: 'Resumo',
            path: paths.dashboard.root,
            icon: ICONS.dashboard,
          },
        ],
      },

      {
        subheader: 'Administração',
        items: [
          {
            title: 'Utilizadores',
            path: paths.dashboard.user.root,
            icon: ICONS.users,
            roles: [
              Authorities.READ_USERS,
              Authorities.READ_ROLES,
              Authorities.READ_PERMISSIONS,
            ],
            children: [
              {
                title: 'Listar',
                path: paths.dashboard.user.list,
                roles: [Authorities.READ_USERS],
              },
              {
                title: 'Novo Utilizador',
                path: paths.dashboard.user.new,
                roles: [Authorities.CREATE_USERS],
              },
              {
                title: 'Perfis',
                path: paths.dashboard.role.list,
                roles: [Authorities.READ_ROLES],
              },
              {
                title: 'Permissões',
                path: paths.dashboard.permission.list,
                roles: [Authorities.READ_PERMISSIONS],
              },
            ],
          },
          {
            title: 'Definições',
            path: paths.dashboard.settings.root,
            icon: ICONS.settings,
            roles: [Authorities.READ_SETTINGS],
          },
          {
            title: 'Empresas',
            path: paths.dashboard.company.root,
            icon: ICONS.companies,
            roles: [Authorities.READ_COMPANIES],
            children: [
              { title: 'Listar', path: paths.dashboard.company.list },
              {
                title: 'Nova empresa',
                path: paths.dashboard.company.new,
                roles: [Authorities.CREATE_COMPANIES],
              },
            ],
          },
        ],
      },
    ],
    []
  );
}
