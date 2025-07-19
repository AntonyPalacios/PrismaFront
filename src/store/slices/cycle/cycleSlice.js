import {createSlice} from '@reduxjs/toolkit';

export const cycleSlice = createSlice({
    name: 'cycle',
    initialState: {
        currentCycle:null,
        currentStage:null,
        selectedStage:{
            id:null,
            name:'',
            startDate:'',
            endDate:''
        },
    },
    reducers: {
        setCurrentCycle: (state, action) => {
            state.currentCycle = action.payload;
        },
        setCurrentStage: (state, action) => {
            state.currentStage = action.payload;
        },
        setSelectedStage: (state, action) => {
            state.selectedStage = action.payload;
        },
        resetSelectedStage: (state,action) => {
            state.selectedStage = {
                id:null,
                name:'',
                startDate:'',
                endDate:'',
                idCycle:action.payload,
            }
        }
    }
});


// Action creators are generated for each case reducer function
export const {setCurrentCycle, setCurrentStage, setSelectedStage, resetSelectedStage} = cycleSlice.actions;