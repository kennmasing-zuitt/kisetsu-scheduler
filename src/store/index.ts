import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { baseApi } from "./baseApi";
import authReducer from "@/mods/auth/authSlice";
import scheduleReducer from "@/mods/schedule/scheduleSlice";
import uiReducer from "./uiSlice";

const rootReducer = combineReducers({
    auth: authReducer,
    schedule: scheduleReducer,
    ui: uiReducer,
    [baseApi.reducerPath]: baseApi.reducer,
});

/** A new store per request/tab, as recommended for the Next.js App Router. */
export const makeStore = () =>
    configureStore({
        reducer: rootReducer,
        middleware: (getDefault) => getDefault().concat(baseApi.middleware),
    });

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = AppStore["dispatch"];
