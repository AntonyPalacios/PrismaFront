import {createSlice} from '@reduxjs/toolkit';

export const alertSlice = createSlice({
    name: 'alert',
    initialState: {
        open:false,
        message: "",
        severity: "",
    },
    reducers: {
        toggleAlert: (state, action) => {
            state.open = !state.open;
            state.message = action.payload?.message?action.payload.message:"";
            state.severity = action.payload?.severity?action.payload.severity:"";
        },
    }
});


// Action creators are generated for each case reducer function
export const {toggleAlert} = alertSlice.actions;