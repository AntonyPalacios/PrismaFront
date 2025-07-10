import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import {students} from "../../../assets/fakeData.jsx";
import { toggleAlert } from '../alert/alertSlice.js';

// Simulando API para operaciones asíncronas
const simulatedApiDelay = 2000; // ms

//Thunk para cargar alumnos
export const fetchStudents = createAsyncThunk(
    'student/fetchStudents',
    async () => {
        return new Promise(resolve => setTimeout(()=>{
            resolve(students);
        }, simulatedApiDelay));
    }
)

// Thunk para Crear
export const onCreateStudent = createAsyncThunk(
    'student/createStudent',
    async (studentData) => {
        return new Promise(resolve => setTimeout(() => {
            console.log('API: Creating student', studentData);
            resolve(studentData); // Devuelve el estudiante creado (ya con ID)
        }, simulatedApiDelay));
    }
);

// Thunk para Actualizar
export const onUpdateStudent = createAsyncThunk(
    'student/updateStudent',
    async (studentData) => {
        return new Promise(resolve => setTimeout(() => {
            console.log('API: Updating student', studentData);
            resolve(studentData); // Devuelve el estudiante actualizado
        }, simulatedApiDelay));
    }
);

// Thunk para Borrar
export const onDeleteStudent = createAsyncThunk(
    'student/deleteStudent',
    async (studentId) => {
        return new Promise(resolve => setTimeout(() => {
            console.log('API: Deleting student', studentId);
            resolve(studentId); // Devuelve el ID del estudiante eliminado
        }, simulatedApiDelay));
    }
);

const initialState = {
    list: students,
    status: 'idle', //'idle','loading','succeeded', 'failed'
    error: null,
}

export const studentSlice = createSlice({
    name: 'student',
    initialState,
    reducers: { //aca solo van los reducers síncronos
        /*onCreateStudent: (state, action) => {
            state.list.push(action.payload)
        },
        onUpdateStudent: (state, action) => {
            const index = state.list.findIndex(student => student.id === action.payload.id)
            if(index !==-1) {
                state.list.splice(index, 1,action.payload)
            }
        },
        onDeleteStudent: (state, action) => {
            const index = state.list.findIndex(student => student.id === action.payload)
            if(index !== -1) {
                state.list.splice(index, 1)
            }
        }*/
    },
    extraReducers:(builder) => {
        builder
            // Listar
            .addCase(fetchStudents.pending, (state) => { state.status = 'loading'; })
            .addCase(fetchStudents.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.list = action.payload; // Usa push directamente con Immer
            })
            .addCase(fetchStudents.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message || 'Error al cargar alumnos.';
            })
            // Crear
            .addCase(onCreateStudent.pending, (state) => { state.status = 'loading'; })
            .addCase(onCreateStudent.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.list.push(action.payload); // Usa push directamente con Immer
                // Despacha la alerta de éxito directamente desde aquí
                action.dispatch(toggleAlert({ message: 'Alumno creado correctamente', severity: 'success' }));
            })
            .addCase(onCreateStudent.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message || 'Error al crear alumno.';
                action.dispatch(toggleAlert({ message: 'Error al crear alumno', severity: 'danger' }));
            })
            // Actualizar
            .addCase(onUpdateStudent.pending, (state) => { state.status = 'loading'; })
            .addCase(onUpdateStudent.fulfilled, (state, action) => {
                state.status = 'succeeded';
                const index = state.list.findIndex(student => student.id === action.payload.id);
                if (index !== -1) { state.list[index] = action.payload; } // Actualiza inmutablemente
                // Despacha la alerta de éxito directamente desde aquí
                action.dispatch(toggleAlert({ message: 'Alumno actualizado correctamente', severity: 'success' }));
            })
            .addCase(onUpdateStudent.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message || 'Error al actualizar alumno.';
                action.dispatch(toggleAlert({ message: 'Error al actualizar alumno', severity: 'danger' }));
            })
            // Borrar
            .addCase(onDeleteStudent.pending, (state) => { state.status = 'loading'; })
            .addCase(onDeleteStudent.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.list = state.list.filter(student => student.id !== action.payload); // filter es inmutable
                // Despacha la alerta de éxito directamente desde aquí
                action.dispatch(toggleAlert({ message: 'Alumno borrado correctamente', severity: 'danger' }));
                action.dispatch(toggleAlert({ message: 'Error al borrar alumno', severity: 'danger' }));
            })
            .addCase(onDeleteStudent.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message || 'Error al borrar alumno.';
            });
    }
})

//export const { } = studentSlice.actions