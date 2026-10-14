// ----------------------------------------------------------------------

export type IPermission = {
  id?: number;
  name: string;
  displayName: string;
  contextPath: string;
  bundler: string;
};

export type IPermissionDeleteResponse = {
  msg: string,
  httpStatus: string
};

export type IPermissionState = {
  isLoading: boolean;
  error: Error | string | null;
  permissions: IPermission[];
  permission: IPermission | null;
};

export type Authority = {
  authority: string
}

export type JwtToken = {
  sub: string,
  authorities: string[],
  iat: number,
  exp: number
}

export type IPermissionPage = {
  content?: IPermission[];
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


export const initialPermissionPageData: IPermissionPage = {
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
