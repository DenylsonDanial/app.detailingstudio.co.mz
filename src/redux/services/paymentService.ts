import { createApi } from '@reduxjs/toolkit/query/react';
//
import { customBaseQuery } from '../../auth/context/jwt/utils';
import {
  IAllocationPreview,
  IPage,
  IPayment,
  IPaymentFilter,
  IPaymentRequest,
  IPaymentReversal,
  PageParams,
} from '../../types/detailing';
import { clientService } from './clientService';
import { entryService } from './entryService';
import { reportService } from './reportService';
import { afterSuccess, cleanParams } from './service-utils';

const path = 'payments';

export type PaymentListParams = PageParams & IPaymentFilter;

/** Um pagamento muda o saldo das entradas, a divida do cliente e os indicadores. */
const dependentInvalidations = () => [
  entryService.util.invalidateTags(['entries']),
  clientService.util.invalidateTags(['clients']),
  reportService.util.invalidateTags(['reports']),
];

export const paymentService = createApi({
  reducerPath: 'paymentService',
  tagTypes: ['payments'],
  baseQuery: customBaseQuery,
  endpoints: (builder) => ({
    getPayments: builder.query<IPage<IPayment>, PaymentListParams>({
      query: (params) => ({ url: `/${path}/list`, params: cleanParams(params) }),
      providesTags: ['payments'],
    }),
    getPayment: builder.query<IPayment, number>({
      query: (id) => ({ url: `/${path}/findById/${id}` }),
      providesTags: ['payments'],
    }),
    previewAllocation: builder.query<IAllocationPreview[], { clientId: number; amount: number }>({
      query: (params) => ({ url: `/${path}/previewAllocation`, params }),
      providesTags: ['payments'],
    }),
    savePayment: builder.mutation<IPayment, IPaymentRequest>({
      query: (body) => ({ url: `/${path}/insert`, method: 'POST', body }),
      invalidatesTags: ['payments'],
      onQueryStarted: (_arg, { dispatch, queryFulfilled }) =>
        afterSuccess(queryFulfilled, () =>
          dependentInvalidations().forEach((action) => dispatch(action))
        ),
    }),
    reversePayment: builder.mutation<IPayment, { id: number; data: IPaymentReversal }>({
      query: ({ id, data }) => ({ url: `/${path}/reverse/${id}`, method: 'POST', body: data }),
      invalidatesTags: ['payments'],
      onQueryStarted: (_arg, { dispatch, queryFulfilled }) =>
        afterSuccess(queryFulfilled, () =>
          dependentInvalidations().forEach((action) => dispatch(action))
        ),
    }),
  }),
});

export const {
  useGetPaymentsQuery,
  useGetPaymentQuery,
  usePreviewAllocationQuery,
  useSavePaymentMutation,
  useReversePaymentMutation,
} = paymentService;
