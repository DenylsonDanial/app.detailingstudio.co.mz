import { createApi } from '@reduxjs/toolkit/query/react';
//
import { customBaseQuery } from '../../auth/context/jwt/utils';
import { ICompany } from '../../types/company';
import { ITenantPage } from '../../types/tenant';
import axios, { endpoints } from '../../utils/axios';

const path = 'companies';

export const companyService = createApi({
  reducerPath: 'companyService',
  tagTypes: ['company'],
  baseQuery: customBaseQuery,
  endpoints: (builder) => ({
    getCompanies: builder.query<ITenantPage, ITenantPage>({
      query: (page: ITenantPage) => ({
        url: `/${path}/list`,
        params: { ...page, content: [] },
      }),
      providesTags: ['company'],
    }),
    getCompany: builder.mutation<ICompany, number>({
      query: (id: number) => ({
        url: `/${path}/findById/${id}`,
        method: 'GET',
      }),
    }),
    saveCompany: builder.mutation<ICompany, ICompany>({
      query: (company: ICompany) => ({
        url: `/${path}/setup`,
        method: 'POST',
        body: company,
      }),
      invalidatesTags: ['company'],
    }),
    updateCompany: builder.mutation<ICompany, ICompany>({
      query: (data: ICompany) => ({
        url: `/${path}/update`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['company'],
    }),
  }),
});

export const {
  useGetCompaniesQuery,
  useSaveCompanyMutation,
  useGetCompanyMutation,
  useUpdateCompanyMutation,
} = companyService;

// ----------------------------------------------------------------------

export const activateCompany = async (id: number | undefined) => {
  if (!id) return '';
  const res = await axios.get(`${endpoints.common.companies}/activate/${id}`);
  return res.data;
};

export const deactivateCompany = async (id: number | undefined) => {
  if (!id) return '';
  const res = await axios.get(`${endpoints.common.companies}/deactivate/${id}`);
  return res.data;
};
