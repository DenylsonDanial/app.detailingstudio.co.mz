import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import {IRole, IRoleState} from "../../types/role";


const initialState : IRoleState = {
    isLoading: false,
    error: null,
    roles: [],
    role: null,
}

const roleSlice = createSlice({
    name: 'role',
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

        // SET ROLES
        setRoles(state, action : PayloadAction<IRole[]>) {
            state.isLoading = false;
            state.roles = action.payload;
        },

        // GET ROLE
        getRoleSuccess(state, action : PayloadAction<IRole>) {
            state.isLoading = false;
            state.role = action.payload;
        },

        // SAVE ROLE
        saveRole(state, action : PayloadAction<IRole>) {
            state.isLoading = false;
            state.roles.push(action.payload);
        },

        // DELETE ROLE
        deleteRole(state, action) {
            state.isLoading = false;
            state.roles = state.roles.filter(item => item.id !== action.payload);
        },
    }
})

export default roleSlice.reducer
export const { hasError, setRoles } = roleSlice.actions