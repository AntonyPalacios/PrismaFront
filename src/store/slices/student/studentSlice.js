import {createSlice} from '@reduxjs/toolkit';
import { createSelector } from 'reselect';

const initialState = {
    students: [],
    studentFilter:{
        stageId:0,
        areaId:0,
        tutorId:0,
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
            console.log(action.payload);
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

        // Aplicar filtro por Stage
        if (filters.stageId && filters.stageId !== 0) { // Asegúrate de manejar 0 si es tu default
            filtered = filtered.filter(student => student.stageId === filters.stageId);
        }

        // Aplicar filtro por Area
        if (filters.areaId && filters.areaId !== 0) {
            filtered = filtered.filter(student => student.areaId === filters.areaId);
        }

        // Aplicar filtro por Tutor
        if (filters.tutorId && filters.tutorId !== 0) {
            filtered = filtered.filter(student => student.tutorId === filters.tutorId);
        }

        // Aplicar filtro por Nombre
        if (filters.name && filters.name.trim() !== '') {
            const lowerCaseNameFilter = filters.name.toLowerCase();
            filtered = filtered.filter(student => student.name.toLowerCase().includes(lowerCaseNameFilter));
        }
        console.log(filtered);
        return filtered;
    }
);