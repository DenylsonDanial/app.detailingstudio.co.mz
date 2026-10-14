import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import {IUser, IUserRow, IUserState} from "../../types/user";


const initialState : IUserState = {
    isLoading: false,
    error: null,
    users: [],
    user: null,
}

const userSlice = createSlice({
    name: 'user',
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

        // GET UserS
        setUsers(state, action : PayloadAction<IUserRow[]>) {
            state.isLoading = false;
            state.users = action.payload;
        },

        // GET User
        getUserSuccess(state, action : PayloadAction<IUser>) {
            state.isLoading = false;
            state.user = action.payload;
        },

        // SAVE User
        saveUser(state, action : PayloadAction<IUserRow>) {
            state.isLoading = false;
            state.users.push(action.payload);
        },

        // GET User
        deleteUser(state, action) {
            state.isLoading = false;
            state.users = state.users.filter(item => item.id !== action.payload);
        },
    }
})

export default userSlice.reducer
export const { hasError, setUsers } = userSlice.actions