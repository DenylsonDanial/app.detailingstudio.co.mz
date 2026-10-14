import {IRole} from "./role";
import { ITenant } from './tenant';

export enum Gender {
  MASCULINO = 'M',
  FEMENINO = 'F'
}

export const USER_STATUS_OPTIONS = [
  { value: 'active', label: 'Activa' },
  { value: 'suspended', label: 'Suspensa' }
];


export type IUserAccountChangePassword = {
  oldPassword: string;
  newPassword: string;
  confirmNewPassword: string;
};

export type IUser = {
  id: number;
  name: string;
  username: string;
  email: string;
  address?: string,
  phone: string;
  nuit?: number;
  firstName: string;
  surname: string;
  gender?: string;
  status?: string;
  photo?: string;
  roles: IRole[];
  businessLocations?: ITenant[];
};

export type IUserRow = {
  id: number;
  name: string;
  nuit?: number;
  username: string;
  email: string;
  gender?: string;
  roles: IRole[];
  userStatus: string;
  businessLocations: ITenant[];
};

export type IUserCreate = {
  id?: number;
  username: string;
  email: string;
  firstName: string;
  surname: string;
  gender?: string;
  phone?: string;
  address?: string;
  rolesIds?: number[];
  roles?: IRole[];
  businessLocations?: ITenant[];
  locationsIds?: number[];
  status?: string;
  isVerified?: boolean;
  passwordConfirm?: string,
  currentPassword?: string,
  password?: string,
};

export type IUserDeleteResponse = {
  msg: string;
  httpStatus: string
};

export type IUserState = {
  isLoading: boolean;
  error: Error | string | null;
  users: IUserRow[];
  user: IUser | null;
};

export type IUserPage = {
  content?: IUserRow[];
  surname?: boolean;
  totalPages?: number;
  totalElements?: number;
  size?: number;
  page?: number;
  first?: boolean;
  numberOfElements?: number;
  empty?: boolean;
  status?: string;
}

export const initialUserPageData: IUserPage = {
  surname: false,
  totalPages: 0,
  totalElements: 0,
  size: 5,
  page: 1,
  first: true,
  numberOfElements: 0,
  empty: true,
  content: [],
  status: ''
}

export type ValidationErrors = { [key: string]: string };

export function validateUser(
  userId: string | number | null | undefined,
  user: IUserCreate
): ValidationErrors {
  const errors: ValidationErrors = {};

  // Only validate if userId is not provided
  if (!userId) {
    if (!user.username) {
      errors.username = 'Nome de utilizador é obrigatório';
    }

    if (!user.email) {
      errors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(user.email)) {
      errors.email = 'Email deve ser válido';
    }

    if (!user.firstName) {
      errors.firstName = 'Primeiro nome é obrigatório';
    }

    if (user.rolesIds?.length === 0) {
      errors.roles = 'Seleccione pelo menos uma função';
    }

    if (!user.surname) {
      errors.surname = 'O apelido é obrigatório';
    }

    if (!user.password) {
      errors.password = 'A palavra-passe é obrigatória';
    }

    if (!user.passwordConfirm) {
      errors.passwordConfirm = 'A confirmação da palavra-passe é obrigatória';
    } else if (user.password !== user.passwordConfirm) {
      errors.passwordConfirm = 'As palavras-passe não coincidem';
    }
  }

  return errors;
}
