import { createApi } from '@reduxjs/toolkit/query/react';
//
import { customBaseQuery } from '../../auth/context/jwt/utils';
import {
  IChangeHistory,
  IClient,
  IClientRequest,
  IPage,
  PageParams,
  RecordStatus,
} from '../../types/detailing';
import { cleanParams } from './service-utils';

const path = 'clients';

export type ClientListParams = PageParams & { status?: RecordStatus; term?: string };

export const clientService = createApi({
  reducerPath: 'clientService',
  tagTypes: ['clients'],
  baseQuery: customBaseQuery,
  endpoints: (builder) => ({
    getClients: builder.query<IPage<IClient>, ClientListParams>({
      query: (params) => ({ url: `/${path}/list`, params: cleanParams(params) }),
      providesTags: ['clients'],
    }),
    getClient: builder.query<IClient, number>({
      query: (id) => ({ url: `/${path}/findById/${id}` }),
      providesTags: ['clients'],
    }),
    getClientHistory: builder.query<IChangeHistory[], number>({
      query: (id) => ({ url: `/${path}/history/${id}` }),
      providesTags: ['clients'],
    }),
    getDuplicates: builder.query<IClient[], { phone: string; excludeId?: number }>({
      query: (params) => ({ url: `/${path}/duplicates`, params: cleanParams(params) }),
    }),
    saveClient: builder.mutation<IClient, IClientRequest>({
      query: (body) => ({ url: `/${path}/insert`, method: 'POST', body }),
      invalidatesTags: ['clients'],
    }),
    updateClient: builder.mutation<IClient, { id: number; data: IClientRequest }>({
      query: ({ id, data }) => ({ url: `/${path}/update/${id}`, method: 'PUT', body: data }),
      invalidatesTags: ['clients'],
    }),
    updateCredit: builder.mutation<
      IClient,
      { id: number; creditAllowed: boolean; reason?: string }
    >({
      query: ({ id, ...body }) => ({ url: `/${path}/credit/${id}`, method: 'PUT', body }),
      invalidatesTags: ['clients'],
    }),
    setClientStatus: builder.mutation<IClient, { id: number; archive: boolean }>({
      query: ({ id, archive }) => ({
        url: `/${path}/${archive ? 'archive' : 'unarchive'}/${id}`,
        method: 'PUT',
      }),
      invalidatesTags: ['clients'],
    }),
  }),
});

export const {
  useGetClientsQuery,
  useGetClientQuery,
  useGetClientHistoryQuery,
  useLazyGetDuplicatesQuery,
  useSaveClientMutation,
  useUpdateClientMutation,
  useUpdateCreditMutation,
  useSetClientStatusMutation,
} = clientService;
