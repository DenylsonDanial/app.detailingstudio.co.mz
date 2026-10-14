import { createApi } from '@reduxjs/toolkit/query/react';
//
import { customBaseQuery } from '../../auth/context/jwt/utils';
import { IPage, IVehicle, IVehicleRequest, PageParams, RecordStatus } from '../../types/detailing';
import { clientService } from './clientService';
import { afterSuccess, cleanParams } from './service-utils';

const path = 'vehicles';

export type VehicleListParams = PageParams & {
  status?: RecordStatus;
  clientId?: number;
  term?: string;
};

/** A ficha do cliente mostra as viaturas: qualquer alteracao refresca tambem os clientes. */
export const vehicleService = createApi({
  reducerPath: 'vehicleService',
  tagTypes: ['vehicles'],
  baseQuery: customBaseQuery,
  endpoints: (builder) => ({
    getVehicles: builder.query<IPage<IVehicle>, VehicleListParams>({
      query: (params) => ({ url: `/${path}/list`, params: cleanParams(params) }),
      providesTags: ['vehicles'],
    }),
    saveVehicle: builder.mutation<IVehicle, IVehicleRequest>({
      query: (body) => ({ url: `/${path}/insert`, method: 'POST', body }),
      invalidatesTags: ['vehicles'],
      onQueryStarted: (_arg, { dispatch, queryFulfilled }) =>
        afterSuccess(queryFulfilled, () =>
          dispatch(clientService.util.invalidateTags(['clients']))
        ),
    }),
    updateVehicle: builder.mutation<IVehicle, { id: number; data: IVehicleRequest }>({
      query: ({ id, data }) => ({ url: `/${path}/update/${id}`, method: 'PUT', body: data }),
      invalidatesTags: ['vehicles'],
      onQueryStarted: (_arg, { dispatch, queryFulfilled }) =>
        afterSuccess(queryFulfilled, () =>
          dispatch(clientService.util.invalidateTags(['clients']))
        ),
    }),
    reassignVehicle: builder.mutation<IVehicle, { id: number; clientId: number; reason: string }>({
      query: ({ id, ...body }) => ({ url: `/${path}/reassign/${id}`, method: 'PUT', body }),
      invalidatesTags: ['vehicles'],
      onQueryStarted: (_arg, { dispatch, queryFulfilled }) =>
        afterSuccess(queryFulfilled, () =>
          dispatch(clientService.util.invalidateTags(['clients']))
        ),
    }),
    setVehicleStatus: builder.mutation<IVehicle, { id: number; archive: boolean }>({
      query: ({ id, archive }) => ({
        url: `/${path}/${archive ? 'archive' : 'unarchive'}/${id}`,
        method: 'PUT',
      }),
      invalidatesTags: ['vehicles'],
      onQueryStarted: (_arg, { dispatch, queryFulfilled }) =>
        afterSuccess(queryFulfilled, () =>
          dispatch(clientService.util.invalidateTags(['clients']))
        ),
    }),
  }),
});

export const {
  useGetVehiclesQuery,
  useSaveVehicleMutation,
  useUpdateVehicleMutation,
  useReassignVehicleMutation,
  useSetVehicleStatusMutation,
} = vehicleService;
