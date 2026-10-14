import { combineReducers } from '@reduxjs/toolkit';
// slices
import permissionReducer from './slices/permissionSlice';
import roleReducer from './slices/roleSlice';
import userReducer from './slices/userSlice';
// services
import { businessService } from './services/businessService';
import { catalogService } from './services/catalogService';
import { clientService } from './services/clientService';
import { entryService } from './services/entryService';
import { expenseService } from './services/expenseService';
import { paymentService } from './services/paymentService';
import { reportService } from './services/reportService';
import { vehicleService } from './services/vehicleService';
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
  [catalogService.reducerPath]: catalogService.reducer,
  [clientService.reducerPath]: clientService.reducer,
  [entryService.reducerPath]: entryService.reducer,
  [expenseService.reducerPath]: expenseService.reducer,
  [paymentService.reducerPath]: paymentService.reducer,
  [reportService.reducerPath]: reportService.reducer,
  [vehicleService.reducerPath]: vehicleService.reducer,
  [commonService.reducerPath]: commonService.reducer,
  [companyService.reducerPath]: companyService.reducer,
  [permissionService.reducerPath]: permissionService.reducer,
  [roleService.reducerPath]: roleService.reducer,
  [userService.reducerPath]: userService.reducer,
});

export default rootReducer;
