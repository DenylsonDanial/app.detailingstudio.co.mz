import { createApi } from '@reduxjs/toolkit/query/react';
//
import { customBaseQuery } from '../../auth/context/jwt/utils';
import { ITenant } from '../../types/tenant';
import { IUser, IUserCreate, IUserDeleteResponse, IUserPage } from '../../types/user';

const path = 'users';

type UpdateProps = {
  data: IUserCreate;
  id: number;
  isAccessUpdate: boolean;
};

type PasswordSet = {
  passwordConfirm: string;
  password: string;
  id?: number;
};

export const userService = createApi({
  reducerPath: 'userService',
  tagTypes: ['users'],
  baseQuery: customBaseQuery,
  endpoints: (builder) => ({
    getUsers: builder.query<IUserPage, IUserPage>({
      query: (page: IUserPage) => ({
        url: `/${path}/list`,
        params: { ...page, content: [] },
      }),
      providesTags: ['users'],
    }),
    getUser: builder.mutation<IUser, number>({
      query: (id: number) => ({
        url: `/${path}/findById/${id}`,
        method: 'GET',
      }),
    }),
    getLoggedUser: builder.mutation<IUser, void>({
      query: () => ({
        url: `/${path}/loggedUserInfo`,
        method: 'GET',
      }),
    }),
    getMyCompanies: builder.query<ITenant[], void>({
      query: () => ({
        url: `/${path}/myCompanies`,
        method: 'GET',
      }),
    }),
    saveUser: builder.mutation<IUser, IUserCreate>({
      query: (user: IUserCreate) => ({
        url: `/${path}/insert`,
        method: 'POST',
        body: user,
      }),
      invalidatesTags: ['users'],
    }),
    setPassword: builder.mutation<string, PasswordSet>({
      query: (creds: PasswordSet) => ({
        url: `/${path}/setPassword/${creds.id}`,
        method: 'POST',
        body: creds,
      }),
      invalidatesTags: ['users'],
    }),
    /** Reposicao feita pelo administrador: a API envia a nova palavra-passe por email. */
    resetPassword: builder.mutation<{ msg: string }, number>({
      query: (id: number) => ({
        url: `/${path}/resetPassword/${id}`,
        method: 'POST',
      }),
      invalidatesTags: ['users'],
    }),
    updateUser: builder.mutation<IUser, Partial<UpdateProps>>({
      query: (data) => ({
        url: `/${path}/update/${data.id}`,
        method: 'PUT',
        body: data.data,
        params: { isAccessUpdate: data.isAccessUpdate },
      }),
      invalidatesTags: ['users'],
    }),
    deleteUser: builder.mutation<IUserDeleteResponse, number>({
      query: (id: number) => ({
        url: `/${path}/deleteById/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['users'],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useGetLoggedUserMutation,
  useGetMyCompaniesQuery,
  useSaveUserMutation,
  useDeleteUserMutation,
  useGetUserMutation,
  useUpdateUserMutation,
  useSetPasswordMutation,
  useResetPasswordMutation,
} = userService;
