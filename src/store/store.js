import { configureStore } from '@reduxjs/toolkit'
import {studentSlice} from "./slices/student/studentSlice.js";
import {alertSlice} from "./slices/alert/alertSlice.js";
import {apiSlice} from "./slices/api/apiSlice.js";
import {userSlice} from "./slices/user/userSlice.js";

export const store = configureStore({
    reducer: {
        student: studentSlice.reducer,
        alert: alertSlice.reducer,
        user:userSlice.reducer,
        [apiSlice.reducerPath]: apiSlice.reducer
    },
    // Añade el middleware de la API
   middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
    //devTools: process.env.NODE_ENV !== 'production',
})