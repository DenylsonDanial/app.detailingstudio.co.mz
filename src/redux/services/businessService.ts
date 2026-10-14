import { createApi } from '@reduxjs/toolkit/query/react';
//
import { customBaseQuery } from '../../auth/context/jwt/utils';
import { IBusinessSetting } from '../../types/businessSetting';

const path = 'business';

export const businessService = createApi({
  reducerPath: 'businessService',
  tagTypes: ['business'],
  baseQuery: customBaseQuery,
  endpoints: (builder) => ({
    getBusiness: builder.mutation<IBusinessSetting, void>({
      query: () => ({
        url: `/${path}/findFirst`,
        method: 'GET',
      }),
    }),
    updateBusiness: builder.mutation<IBusinessSetting, FormData | IBusinessSetting>({
      query: (business) => ({
        url: `/${path}/update`,
        method: 'PUT',
        body: business,
      }),
      invalidatesTags: ['business'],
    }),
  }),
});

export const { useUpdateBusinessMutation, useGetBusinessMutation } = businessService;
