import {createSlice} from '@reduxjs/toolkit';

export const cycleSlice = createSlice({
    name: 'cycle',
    initialState: {
        currentCycle:null,
        currentStage:null,
    },
    reducers: {
        setCurrentCycle: (state, action) => {
            state.currentCycle = action.payload;
        },
        setCurrentStage: (state, action) => {
            state.currentStage = action.payload;
        },
    }
});


// Action creators are generated for each case reducer function
export const {setCurrentCycle, setCurrentStage} = cycleSlice.actions;