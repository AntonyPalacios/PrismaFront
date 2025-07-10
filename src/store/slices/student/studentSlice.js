import { createSlice } from '@reduxjs/toolkit';
import {students} from "../../../assets/fakeData.jsx";

const initialState = {
    students,

}

export const studentSlice = createSlice({
    name: 'student',
    initialState,
    reducers: {
        onCreateStudent: (state, action) => {
            state.students.push(action.payload)
        },
        onUpdateStudent: (state, action) => {
            const index = state.students.findIndex(student => student.id === action.payload.id)
            if(index !==-1) {
                state.students.splice(index, 1,action.payload)
            }
        },
        onDeleteStudent: (state, action) => {
            const index = state.students.findIndex(student => student.id === action.payload)
            if(index !== -1) {
                state.students.splice(index, 1)
            }
        }
    }
})

export const { onCreateStudent, onUpdateStudent, onDeleteStudent } = studentSlice.actions