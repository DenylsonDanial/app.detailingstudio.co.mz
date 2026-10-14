import { combineReducers } from '@reduxjs/toolkit';
// slices
import permissionReducer from './slices/permissionSlice';
import roleReducer from './slices/roleSlice';
import userReducer from './slices/userSlice';
// services
import { businessService } from './services/businessService';
import { commonService } from './services/commonService';
import { companyService } from './services/companyService';
import { permissionService } from './services/permissionService';
import { roleService } from './services/roleService';
import { userService } from './services/userService';

// ----------------------------------------------------------------------

/**
 * O estado nao e persistido: a sessao vive do refresh token e os dados de
 * negocio sao sempre lidos da API, para nao haver caches locais desactualizados
 * ao trocar de empresa (multi-tenant).
 */
const rootReducer = combineReducers({
  permission: permissionReducer,
  role: roleReducer,
  user: userReducer,
  [businessService.reducerPath]: businessService.reducer,
  [commonService.reducerPath]: commonService.reducer,
  [companyService.reducerPath]: companyService.reducer,
  [permissionService.reducerPath]: permissionService.reducer,
  [roleService.reducerPath]: roleService.reducer,
  [userService.reducerPath]: userService.reducer,
});

export default rootReducer;
