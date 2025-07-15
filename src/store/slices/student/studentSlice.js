import {createSlice} from '@reduxjs/toolkit';
import { createSelector } from 'reselect';

const initialState = {
    students: [],
    studentFilter:{
        stageId:1,
        areaId:-1,
        tutorId:-1,
        name:''
    }
}

export const studentSlice = createSlice({
    name: 'student',
    initialState,
    reducers: {
        setFilter: (state, action) => {
            state.studentFilter = {...state.studentFilter, ...action.payload};
        },
        setStudents: (state, action) => {
            state.students = action.payload;
        }
    },
})

export const {
    setFilter,
    setStudents} = studentSlice.actions

// --- Selectores ---
// Selector para obtener la lista completa de estudiantes
const selectAllStudents = (state) => state.student.students;
// Selector para obtener el objeto de filtros
const selectStudentFilter = (state) => state.student.studentFilter;

// Selector memorizado para obtener la lista de estudiantes FILTRADA
// Este selector se ejecutará solo cuando cambie selectAllStudents o selectStudentFilter
export const selectFilteredStudents = createSelector(
    [selectAllStudents, selectStudentFilter],
    (allStudents, filters) => {
        let filtered = allStudents;

        // Aplicar filtro por Area
        if (filters.areaId && filters.areaId !== -1) {
            filtered = filtered.filter(student => student.areaId === filters.areaId);
        }

        // Aplicar filtro por Tutor
        if ( filters.tutorId !== -1) {
            filtered = filtered.filter(student => student.tutorId === filters.tutorId);
        }

        // Aplicar filtro por Nombre
        if ( filters.name.trim() !== '') {
            const lowerCaseNameFilter = filters.name.toLowerCase();
            filtered = filtered.filter(student => student.name.toLowerCase().includes(lowerCaseNameFilter));
        }
        return filtered;
    }
);