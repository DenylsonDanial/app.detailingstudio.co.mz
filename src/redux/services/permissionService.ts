import { createApi } from '@reduxjs/toolkit/query/react'
import {IPermission, IPermissionDeleteResponse} from "../../types/permission";
import {customBaseQuery} from "../../auth/context/jwt/utils";
import { IPermissionPage } from '../../types/permission';

const path: string = 'permissions'

export const permissionService = createApi({
    reducerPath: 'permissionService',
    tagTypes: ['permissions'],
    baseQuery: customBaseQuery,
    endpoints: (builder) => ({
        getPermissions: builder.query<IPermission[], IPermission[]>({
            query: () => ({
                url: `/${path}/findAll`,
            }),
            providesTags: ['permissions']
        }),
        getPermissionsPaginated: builder.query<IPermissionPage, IPermissionPage>({
            query: (page : IPermissionPage) => ({
                url: `/${path}/list`,
                params: { ...page, content: [] }
            }),
            providesTags: ['permissions']
        }),
        getPermission: builder.mutation<IPermission, number>({
            query: (id: number) => ({
                url: `/${path}/${id}`,
                method: 'GET'
            })
        }),
        savePermission: builder.mutation<IPermission, IPermission>({
            query: (permission: IPermission) => ({
                url: `/${path}/insert`,
                method: 'POST',
                body: permission
            }),
            invalidatesTags: ['permissions']
        }),
        updatePermission: builder.mutation<IPermission, Partial<IPermission>>({
            query: (data: IPermission) => ({
                url: `/${path}/update/${data.id}`,
                method: 'PUT',
                body: data
            }),
            invalidatesTags: ['permissions']
        }),
        deletePermission: builder.mutation<IPermissionDeleteResponse, number>({
            query: (id: number) => ({
                url: `/${path}/deleteById/${id}`,
                method: 'DELETE'
            }),
            invalidatesTags: ['permissions']
        })
    }),
})

export const {
    useGetPermissionsQuery,
    useSavePermissionMutation,
    useDeletePermissionMutation,
    useGetPermissionMutation,
    useUpdatePermissionMutation,
    useGetPermissionsPaginatedQuery
} = permissionService
