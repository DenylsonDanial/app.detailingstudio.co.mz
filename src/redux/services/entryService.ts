import { createApi } from '@reduxjs/toolkit/query/react';
//
import { customBaseQuery } from '../../auth/context/jwt/utils';
import {
  IChangeHistory,
  IEntry,
  IEntryFilter,
  IEntryRequest,
  IEntryRow,
  IPage,
  PageParams,
  WorkStatus,
} from '../../types/detailing';
import { clientService } from './clientService';
import { reportService } from './reportService';
import { afterSuccess, cleanParams } from './service-utils';

const path = 'entries';

export type EntryListParams = PageParams & IEntryFilter;

/** Entradas alteram a divida do cliente e os indicadores do resumo. */
const dependentInvalidations = () => [
  clientService.util.invalidateTags(['clients']),
  reportService.util.invalidateTags(['reports']),
];

export const entryService = createApi({
  reducerPath: 'entryService',
  tagTypes: ['entries'],
  baseQuery: customBaseQuery,
  endpoints: (builder) => ({
    getEntries: builder.query<IPage<IEntryRow>, EntryListParams>({
      query: (params) => ({ url: `/${path}/list`, params: cleanParams(params) }),
      providesTags: ['entries'],
    }),
    getOpenEntries: builder.query<IEntryRow[], number>({
      query: (clientId) => ({ url: `/${path}/open/${clientId}` }),
      providesTags: ['entries'],
    }),
    getEntry: builder.query<IEntry, number>({
      query: (id) => ({ url: `/${path}/findById/${id}` }),
      providesTags: ['entries'],
    }),
    getEntryHistory: builder.query<IChangeHistory[], number>({
      query: (id) => ({ url: `/${path}/history/${id}` }),
      providesTags: ['entries'],
    }),
    saveEntry: builder.mutation<IEntry, IEntryRequest>({
      query: (body) => ({ url: `/${path}/insert`, method: 'POST', body }),
      invalidatesTags: ['entries'],
      onQueryStarted: (_arg, { dispatch, queryFulfilled }) =>
        afterSuccess(queryFulfilled, () =>
          dependentInvalidations().forEach((action) => dispatch(action))
        ),
    }),
    updateEntry: builder.mutation<IEntry, { id: number; data: IEntryRequest }>({
      query: ({ id, data }) => ({ url: `/${path}/update/${id}`, method: 'PUT', body: data }),
      invalidatesTags: ['entries'],
      onQueryStarted: (_arg, { dispatch, queryFulfilled }) =>
        afterSuccess(queryFulfilled, () =>
          dependentInvalidations().forEach((action) => dispatch(action))
        ),
    }),
    changeEntryStatus: builder.mutation<
      IEntry,
      { id: number; workStatus: WorkStatus; reason?: string }
    >({
      query: ({ id, ...body }) => ({ url: `/${path}/status/${id}`, method: 'PUT', body }),
      invalidatesTags: ['entries'],
      onQueryStarted: (_arg, { dispatch, queryFulfilled }) =>
        afterSuccess(queryFulfilled, () =>
          dependentInvalidations().forEach((action) => dispatch(action))
        ),
    }),
    cancelEntry: builder.mutation<IEntry, { id: number; reason: string }>({
      query: ({ id, ...body }) => ({ url: `/${path}/cancel/${id}`, method: 'PUT', body }),
      invalidatesTags: ['entries'],
      onQueryStarted: (_arg, { dispatch, queryFulfilled }) =>
        afterSuccess(queryFulfilled, () =>
          dependentInvalidations().forEach((action) => dispatch(action))
        ),
    }),
    saveOpeningBalance: builder.mutation<
      IEntry,
      { clientId: number; amount: number; date: string; notes?: string }
    >({
      query: (body) => ({ url: `/${path}/openingBalance`, method: 'POST', body }),
      invalidatesTags: ['entries'],
      onQueryStarted: (_arg, { dispatch, queryFulfilled }) =>
        afterSuccess(queryFulfilled, () =>
          dependentInvalidations().forEach((action) => dispatch(action))
        ),
    }),
  }),
});

export const {
  useGetEntriesQuery,
  useGetOpenEntriesQuery,
  useGetEntryQuery,
  useGetEntryHistoryQuery,
  useSaveEntryMutation,
  useUpdateEntryMutation,
  useChangeEntryStatusMutation,
  useCancelEntryMutation,
  useSaveOpeningBalanceMutation,
} = entryService;
