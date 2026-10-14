import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
//
import rootReducer from './rootReducer';
import { businessService } from './services/businessService';
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
