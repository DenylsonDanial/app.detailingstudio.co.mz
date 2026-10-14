// ----------------------------------------------------------------------

import {IPermission} from "./permission";

export type IRole = {
  id: number;
  name: string;
  displayName: string;
  permissionsIds?: number[],
  permissions: IPermission[];
};

export type IRoleCreate = {
  id?: number;
  name: string;
  displayName: string;
  permissions?: number[],
};

export type IRoleDeleteResponse = {
  msg: string,
  httpStatus: string
};

export type IRoleState = {
  isLoading: boolean;
  error: Error | string | null;
  roles: IRole[];
  role: IRole | null;
};

export type IRolePage = {
  content: IRole[];
  last: boolean;
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  first: boolean;
  numberOfElements: number;
  empty: boolean;
  role?: string;
  status?: string;
  name?: string
}

export const initialRolePageData: IRolePage = {
  last: true,
  totalPages: 0,
  totalElements: 0,
  size: 500,
  number: 0,
  first: true,
  numberOfElements: 0,
  empty: true,
  content: [{
    "id": 0,
    "name": "",
    "displayName": "",
    "permissions": [
      {
        "id": 0,
        "name": "",
        "displayName": "",
        "contextPath": "",
        "bundler": ""
      }
    ]
  }]
}
