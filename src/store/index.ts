import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { api } from "./api";
import authReducer from "./authSlice";
import scheduleReducer from "./scheduleSlice";

const rootReducer = combineReducers({
  auth: authReducer,
  schedule: scheduleReducer,
  [api.reducerPath]: api.reducer,
});

/** A new store per request/tab, as recommended for the Next.js App Router. */
export const makeStore = () =>
  configureStore({
    reducer: rootReducer,
    middleware: (getDefault) => getDefault().concat(api.middleware),
  });

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = AppStore["dispatch"];
