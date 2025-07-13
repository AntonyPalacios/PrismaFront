import {createSlice} from '@reduxjs/toolkit';

export const cycleSlice = createSlice({
    name: 'cycle',
    initialState: {
        currentCycle:null
    },
    reducers: {
        setCurrentCycle: (state, action) => {
            state.currentCycle = action.payload;
        },
    }
});


// Action creators are generated for each case reducer function
export const {setCurrentCycle} = cycleSlice.actions;