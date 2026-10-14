import { createApi } from '@reduxjs/toolkit/query/react';
//
import { customBaseQuery } from '../../auth/context/jwt/utils';
import {
  IExpense,
  IExpenseCategory,
  IExpenseFilter,
  IExpenseRequest,
  IPage,
  PageParams,
} from '../../types/detailing';
import { reportService } from './reportService';
import { afterSuccess, cleanParams } from './service-utils';

const path = 'expenses';

export type ExpenseListParams = PageParams & IExpenseFilter;

export const expenseService = createApi({
  reducerPath: 'expenseService',
  tagTypes: ['expenses', 'expenseCategories'],
  baseQuery: customBaseQuery,
  endpoints: (builder) => ({
    getExpenses: builder.query<IPage<IExpense>, ExpenseListParams>({
      query: (params) => ({ url: `/${path}/list`, params: cleanParams(params) }),
      providesTags: ['expenses'],
    }),
    saveExpense: builder.mutation<IExpense, IExpenseRequest>({
      query: (body) => ({ url: `/${path}/insert`, method: 'POST', body }),
      invalidatesTags: ['expenses'],
      onQueryStarted: (_arg, { dispatch, queryFulfilled }) =>
        afterSuccess(queryFulfilled, () =>
          dispatch(reportService.util.invalidateTags(['reports']))
        ),
    }),
    reverseExpense: builder.mutation<IExpense, { id: number; reason: string }>({
      query: ({ id, reason }) => ({
        url: `/${path}/reverse/${id}`,
        method: 'POST',
        body: { reason },
      }),
      invalidatesTags: ['expenses'],
      onQueryStarted: (_arg, { dispatch, queryFulfilled }) =>
        afterSuccess(queryFulfilled, () =>
          dispatch(reportService.util.invalidateTags(['reports']))
        ),
    }),
    getExpenseCategories: builder.query<IPage<IExpenseCategory>, PageParams>({
      query: (params) => ({ url: `/${path}/categories/list`, params: cleanParams(params) }),
      providesTags: ['expenseCategories'],
    }),
    saveExpenseCategory: builder.mutation<
      IExpenseCategory,
      { id?: number; name: string; active?: boolean }
    >({
      query: ({ id, ...body }) =>
        id
          ? { url: `/${path}/categories/update/${id}`, method: 'PUT', body }
          : { url: `/${path}/categories/insert`, method: 'POST', body },
      invalidatesTags: ['expenseCategories'],
    }),
  }),
});

export const {
  useGetExpensesQuery,
  useSaveExpenseMutation,
  useReverseExpenseMutation,
  useGetExpenseCategoriesQuery,
  useSaveExpenseCategoryMutation,
} = expenseService;
