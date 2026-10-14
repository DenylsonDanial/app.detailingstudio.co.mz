import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import {IPermission, IPermissionState} from "../../types/permission";


const initialState : IPermissionState = {
    isLoading: false,
    error: null,
    permissions: [],
    permission: null,
}

const permissionSlice = createSlice({
    name: 'permission',
    initialState,
    reducers: {
        // START LOADING
        startLoading(state) {
            state.isLoading = true;
        },

        // HAS ERROR
        hasError(state, action : PayloadAction<Error | string | null>) {
            state.isLoading = false;
            state.error = action.payload;
        },

        // GET PERMISSIONS
        getPermissionsSuccess(state, action : PayloadAction<IPermission[]>) {
            state.isLoading = false;
            state.permissions = action.payload;
        },

        // GET PERMISSION
        getPermissionSuccess(state, action : PayloadAction<IPermission>) {
            state.isLoading = false;
            state.permission = action.payload;
        },

        // SAVE PERMISSION
        savePermission(state, action : PayloadAction<IPermission>) {
            state.isLoading = false;
            state.permissions.push(action.payload);
        },

        // GET PERMISSION
        deletePermission(state, action) {
            state.isLoading = false;
            state.permissions = state.permissions.filter(item => item.id !== action.payload);
        },
    }
})

export default permissionSlice.reducer
export const { hasError } = permissionSlice.actions