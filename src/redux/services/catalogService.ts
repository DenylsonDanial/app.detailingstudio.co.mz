import { createApi } from '@reduxjs/toolkit/query/react';
//
import { customBaseQuery } from '../../auth/context/jwt/utils';
import {
  IPage,
  IServiceItem,
  IServiceItemRequest,
  PageParams,
  RecordStatus,
} from '../../types/detailing';
import { cleanParams } from './service-utils';

/** Catalogo de servicos e precos (rota /services da API). */
const path = 'services';

export type ServiceListParams = PageParams & { status?: RecordStatus; term?: string };

export const catalogService = createApi({
  reducerPath: 'catalogService',
  tagTypes: ['services'],
  baseQuery: customBaseQuery,
  endpoints: (builder) => ({
    getServices: builder.query<IPage<IServiceItem>, ServiceListParams>({
      query: (params) => ({ url: `/${path}/list`, params: cleanParams(params) }),
      providesTags: ['services'],
    }),
    saveService: builder.mutation<IServiceItem, IServiceItemRequest>({
      query: (body) => ({ url: `/${path}/insert`, method: 'POST', body }),
      invalidatesTags: ['services'],
    }),
    updateService: builder.mutation<IServiceItem, { id: number; data: IServiceItemRequest }>({
      query: ({ id, data }) => ({ url: `/${path}/update/${id}`, method: 'PUT', body: data }),
      invalidatesTags: ['services'],
    }),
    setServiceStatus: builder.mutation<IServiceItem, { id: number; archive: boolean }>({
      query: ({ id, archive }) => ({
        url: `/${path}/${archive ? 'archive' : 'unarchive'}/${id}`,
        method: 'PUT',
      }),
      invalidatesTags: ['services'],
    }),
  }),
});

export const {
  useGetServicesQuery,
  useSaveServiceMutation,
  useUpdateServiceMutation,
  useSetServiceStatusMutation,
} = catalogService;
