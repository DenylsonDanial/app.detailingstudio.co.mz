import { createApi } from '@reduxjs/toolkit/query/react'
import {IRole, IRoleCreate, IRoleDeleteResponse, IRolePage} from "../../types/role";
import {customBaseQuery} from "../../auth/context/jwt/utils";

const path: string = 'roles'

export const roleService = createApi({
    reducerPath: 'roleService',
    tagTypes: ['roles'],
    baseQuery: customBaseQuery,
    endpoints: (builder) => ({
        getRoles: builder.query<IRolePage, IRolePage>({
            query: (page : IRolePage) => ({
                url: `/${path}/findAll`,
                params: {
                    page: page.number,
                    size: page.size,
                }
            }),
            providesTags: ['roles']
        }),
        getRole: builder.mutation<IRole, number>({
            query: (id: number) => ({
                url: `/${path}/findById/${id}`,
                method: 'GET'
            })
        }),
        saveRole: builder.mutation<IRole, IRoleCreate>({
            query: (role: IRoleCreate) => ({
                url: `/${path}/insert`,
                method: 'POST',
                body: role
            }),
            invalidatesTags: ['roles'],
        }),
        updateRole: builder.mutation<IRole, Partial<IRoleCreate>>({
            query: (data: IRoleCreate) => ({
                url: `/${path}/update/${data.id}`,
                method: 'PUT',
                body: data
            }),
            invalidatesTags: ['roles']
        }),
        deleteRole: builder.mutation<IRoleDeleteResponse, number>({
            query: (id: number) => ({
                url: `/${path}/deleteById/${id}`,
                method: 'DELETE'
            }),
            invalidatesTags: ['roles']
        })
    }),
})

export const {
    useGetRolesQuery,
    useSaveRoleMutation,
    useDeleteRoleMutation,
    useGetRoleMutation,
    useUpdateRoleMutation,
} = roleService
