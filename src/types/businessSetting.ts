// ----------------------------------------------------------------------


import { ICurrency } from './currency';

export interface IBusinessSetting {
  id?: number;
  businessId?: number;
  businessName?: string;
  nuit?: string | number;
  logo?: string;
  phone?: string;
  altPhone?: string;
  email?: string;
  address?: string;
  website?: string;
  province?: string;
  city?: string;
  activitySector?: string;
  dbTenantName?: string;
  currency?: ICurrency;
  currencyId?: string | number;
  defaultTaxRate?: number | string;
  isActive?: boolean;
  activityStart?: string;
}

export type IBusinessSettingDeleteResponse = {
  msg: string,
  httpStatus: string
};

export type IBusinessSettingState = {
  isLoading: boolean;
  error: Error | string | null;
  businessSettings: IBusinessSetting[];
  businessSetting: IBusinessSetting | null;
};

export type IBusinessSettingPage = {
  content?: IBusinessSetting[];
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


export const initialBusinessSettingPageData: IBusinessSettingPage = {
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
