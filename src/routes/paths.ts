const ROOTS = {
  AUTH: '/auth',
  DASHBOARD: '/dashboard',
  COMPANY: '/companies',
};

/** Constroi o conjunto list/new/edit/detail para um modulo CRUD. */
const crud = (root: string) => ({
  root,
  list: `${root}/list`,
  new: `${root}/new`,
  edit: (id: number | string) => `${root}/${id}/edit`,
  detail: (id: number | string) => `${root}/${id}`,
});

// ----------------------------------------------------------------------

export const paths = {
  auth: {
    login: `${ROOTS.AUTH}/login`,
    forgotPassword: `${ROOTS.AUTH}/forgot-password`,
    resetPassword: `${ROOTS.AUTH}/reset-password`,
    setPassword: `${ROOTS.AUTH}/set-password`,
  },

  dashboard: {
    root: ROOTS.DASHBOARD,

    // Operacao diaria
    entry: crud(`${ROOTS.DASHBOARD}/entries`),
    payment: crud(`${ROOTS.DASHBOARD}/payments`),

    // Clientes e contas
    client: crud(`${ROOTS.DASHBOARD}/clients`),
    vehicle: crud(`${ROOTS.DASHBOARD}/vehicles`),

    // Despesas
    expense: crud(`${ROOTS.DASHBOARD}/expenses`),

    // Servicos e precos
    service: crud(`${ROOTS.DASHBOARD}/services`),

    // Relatorios
    report: {
      root: `${ROOTS.DASHBOARD}/reports`,
    },

    // Administracao
    user: crud(`${ROOTS.DASHBOARD}/users`),
    role: crud(`${ROOTS.DASHBOARD}/roles`),
    permission: {
      root: `${ROOTS.DASHBOARD}/permissions`,
      list: `${ROOTS.DASHBOARD}/permissions/list`,
    },
    audit: {
      root: `${ROOTS.DASHBOARD}/audit`,
      list: `${ROOTS.DASHBOARD}/audit/list`,
    },
    settings: {
      root: `${ROOTS.DASHBOARD}/settings`,
    },

    // Plataforma
    company: {
      root: ROOTS.COMPANY,
      list: `${ROOTS.COMPANY}/list`,
      new: `${ROOTS.COMPANY}/new`,
      edit: `${ROOTS.COMPANY}/edit`,
    },
  },
};
