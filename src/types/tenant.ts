// ----------------------------------------------------------------------

export type ITenant = {
  id?: number;
  tenantId: string;
  tenantName?: string;
  databaseUrl?: string;
  databaseUsername?: string;
  databasePassword?: string;
  active?: boolean;
};

export type ITenantState = {
  isLoading: boolean;
  error: Error | string | null;
  Tenants: ITenant[];
  Tenant: ITenant | null;
};

export type ITenantPage = {
  content?: ITenant[];
  totalPages?: number;
  totalElements?: number;
  size?: number;
  page?: number;
  first?: boolean;
  numberOfElements?: number;
  empty?: boolean;
  status?: string;
  term?: string;
}


export const initialTenantPageData: ITenantPage = {
  totalPages: 0,
  totalElements: 0,
  size: 5,
  page: 1,
  first: true,
  numberOfElements: 0,
  empty: true,
  content: [],
  status: '',
  term: ''
}
