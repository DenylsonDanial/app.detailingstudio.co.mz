// ----------------------------------------------------------------------

import {IUserCreate} from "./user";
import {IBusinessSetting} from "./businessSetting";

export type ICompany = {
  userId?: string | number;
  user?: IUserCreate;
  businessSetting: IBusinessSetting;
};


export type ICompanyDeleteResponse = {
  msg: string,
  httpStatus: string
};

export type ICompanyState = {
  isLoading: boolean;
  error: Error | string | null;
  companies: ICompany[];
  company: ICompany | null;
};


export type ICompanyPage = {
  content?: ICompany[];
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


export const initialCompanyPageData: ICompanyPage = {
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
