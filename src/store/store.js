import { configureStore } from '@reduxjs/toolkit'
import {studentSlice} from "./slices/student/studentSlice.js";
import {alertSlice} from "./slices/alert/alertSlice.js";

export const store = configureStore({
    reducer: {
        student: studentSlice.reducer,
        alert: alertSlice.reducer,
    },
})