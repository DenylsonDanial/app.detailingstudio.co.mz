import { createApi } from '@reduxjs/toolkit/query/react';
//
import { customBaseQuery } from '../../auth/context/jwt/utils';
import { DateRange, IStatement, ISummary } from '../../types/detailing';
import { cleanParams } from './service-utils';

export const reportService = createApi({
  reducerPath: 'reportService',
  tagTypes: ['reports'],
  baseQuery: customBaseQuery,
  endpoints: (builder) => ({
    getSummary: builder.query<ISummary, DateRange>({
      query: (range) => ({ url: '/dashboard/summary', params: cleanParams(range) }),
      providesTags: ['reports'],
    }),
    getStatement: builder.query<IStatement, DateRange & { clientId: number }>({
      query: ({ clientId, ...range }) => ({
        url: `/statements/${clientId}`,
        params: cleanParams(range),
      }),
      providesTags: ['reports'],
    }),
  }),
});

export const { useGetSummaryQuery, useGetStatementQuery } = reportService;
