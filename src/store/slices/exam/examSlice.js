import {createSlice} from "@reduxjs/toolkit";
import {createSelector} from "reselect";

const initialState = {
    exams: [],
    examFilter:{
        stageId:-1,
        cycleId:-1,
        filterName:''
    },
    selectedExam:{
        id:null,
        name:'',
        date:'',
        stageId:null
    }
}

export const examSlice = createSlice({
    name: 'exam',
    initialState,
    reducers: {
        setFilter: (state, action) => {
            state.examFilter = {...state.examFilter, ...action.payload};
        },
        setExams: (state, action) => {
            state.exams = action.payload;
        },
        setSelectedExam: (state, action) => {
            state.selectedExam = action.payload;
        },
        resetSelectedExam: (state, action) => {
            state.selectedExam =  {
                id:null,
                name:'',
                date:'',
                stageId:action.payload,
            }
        }
    }
})

export const {
    setFilter,
    setSelectedExam,
    resetSelectedExam,
    setExams} = examSlice.actions

const selectAllExams = (state) => state.exam.exams;

const selectExamFilter = (state) => state.exam.examFilter;

export const selectFilteredExams = createSelector(
    [selectAllExams, selectExamFilter],
    (allExams, filters) => {
        let filtered = allExams;

        // Aplicar filtro por Nombre
        if ( filters.filterName.trim() !== '') {
            const lowerCaseNameFilter = filters.filterName.toLowerCase();
            filtered = filtered.filter(exam => exam.name.toLowerCase().includes(lowerCaseNameFilter));
        }
        return filtered;
    }
);