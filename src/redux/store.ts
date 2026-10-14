import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
//
import rootReducer from './rootReducer';
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

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      businessService.middleware,
      catalogService.middleware,
      clientService.middleware,
      entryService.middleware,
      expenseService.middleware,
      paymentService.middleware,
      reportService.middleware,
      vehicleService.middleware,
      commonService.middleware,
      companyService.middleware,
      permissionService.middleware,
      roleService.middleware,
      userService.middleware
    ),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
