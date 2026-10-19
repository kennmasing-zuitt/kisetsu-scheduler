import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { AuthPayload, User } from "@/mods/auth/types";

export interface AuthState {
    accessToken: string | null;
    user: User | null;
    /** false until the persisted session has been read from localStorage on the client */
    hydrated: boolean;
}

const initialState: AuthState = { accessToken: null, user: null, hydrated: false };

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        hydrate(state, action: PayloadAction<Pick<AuthState, "accessToken" | "user"> | null>) {
            state.accessToken = action.payload?.accessToken ?? null;
            state.user = action.payload?.user ?? null;
            state.hydrated = true;
        },
        /** Stores the register/login result; the server calls the access token `token`. */
        setCredentials(state, action: PayloadAction<AuthPayload>) {
            state.accessToken = action.payload.token;
            state.user = action.payload.user;
        },
        setUser(state, action: PayloadAction<User>) {
            state.user = action.payload;
        },
        clearCredentials(state) {
            state.accessToken = null;
            state.user = null;
        },
    },
});

export const { hydrate, setCredentials, setUser, clearCredentials } = authSlice.actions;
export default authSlice.reducer;

export const selectIsAuthenticated = (s: { auth: AuthState }) => Boolean(s.auth.accessToken);
