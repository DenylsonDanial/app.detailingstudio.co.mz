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
  entries: icon('solar:wheel-bold-duotone'),
  payments: icon('solar:wallet-money-bold-duotone'),
  clients: icon('solar:users-group-rounded-bold-duotone'),
  vehicles: icon('solar:bus-bold-duotone'),
  expenses: icon('solar:bill-list-bold-duotone'),
  services: icon('solar:tag-price-bold-duotone'),
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
 * As areas seguem a especificacao: Resumo, Operacao diaria, Clientes e contas,
 * Despesas, Servicos e precos.
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
        subheader: 'Operação diária',
        items: [
          {
            title: 'Entradas',
            path: paths.dashboard.entry.list,
            icon: ICONS.entries,
            roles: [Authorities.READ_ENTRIES],
          },
          {
            title: 'Pagamentos',
            path: paths.dashboard.payment.list,
            icon: ICONS.payments,
            roles: [Authorities.READ_PAYMENTS],
          },
        ],
      },

      {
        subheader: 'Clientes e contas',
        items: [
          {
            title: 'Clientes',
            path: paths.dashboard.client.list,
            icon: ICONS.clients,
            roles: [Authorities.READ_CLIENTS],
          },
          {
            title: 'Viaturas',
            path: paths.dashboard.vehicle.list,
            icon: ICONS.vehicles,
            roles: [Authorities.READ_VEHICLES],
          },
        ],
      },

      {
        subheader: 'Gestão',
        items: [
          {
            title: 'Despesas',
            path: paths.dashboard.expense.list,
            icon: ICONS.expenses,
            roles: [Authorities.READ_EXPENSES],
          },
          {
            title: 'Serviços e preços',
            path: paths.dashboard.service.list,
            icon: ICONS.services,
            roles: [Authorities.READ_SERVICES],
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
