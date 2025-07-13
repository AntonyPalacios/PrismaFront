import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import {students} from "../../../assets/fakeData.jsx";
import { toggleAlert } from '../alert/alertSlice.js';

// Simulando API para operaciones asíncronas
const simulatedApiDelay = 1000; // ms

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
    async (studentData,{dispatch}) => {
        try{
            const result = await new Promise(resolve => setTimeout(() => {
                resolve(studentData); // Devuelve el estudiante creado (ya con ID)
            }, simulatedApiDelay));
            dispatch(toggleAlert({ message: 'Alumno creado correctamente', severity: 'success' }));
            return result;
        }catch(err){
            dispatch(toggleAlert({ message: 'Error al crear alumno', severity: 'error' })); // Despacha la alerta de éxito
            throw err;
        }
    }
);

// Thunk para Actualizar
export const onUpdateStudent = createAsyncThunk(
    'student/updateStudent',
    async (studentData,{dispatch}) => {
        try {
            const result = await new Promise(resolve => setTimeout(() => {
                resolve(studentData); // Devuelve el estudiante actualizado
            }, simulatedApiDelay));
            // Despacha la alerta de éxito directamente desde aquí
            dispatch(toggleAlert({ message: 'Alumno actualizado correctamente', severity: 'success' }));
            return result;
        }catch(err){
            dispatch(toggleAlert({ message: 'Error al actualizar alumno', severity: 'error' }));
            throw err;
        }

    }
);

// Thunk para Borrar
export const onDeleteStudent = createAsyncThunk(
    'student/deleteStudent',
    async (studentId,{dispatch}) => {
        try {
            const result = await new Promise(resolve => setTimeout(() => {
                resolve(studentId); // Devuelve el ID del estudiante eliminado
            }, simulatedApiDelay));
            dispatch(toggleAlert({ message: 'Alumno borrado correctamente', severity: 'error' }));
            return result;
        }catch(err){
            dispatch(toggleAlert({ message: 'Error al borrar alumno', severity: 'error' }));
            throw err;
        }
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
    extraReducers:(builder) => { //para reducers asíncronos que tengan que ver con el estado
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
            })
            .addCase(onCreateStudent.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message || 'Error al crear alumno.';
            })
            // Actualizar
            .addCase(onUpdateStudent.pending, (state) => { state.status = 'loading'; })
            .addCase(onUpdateStudent.fulfilled, (state, action) => {
                state.status = 'succeeded';
                const index = state.list.findIndex(student => student.id === action.payload.id);
                if (index !== -1) { state.list[index] = action.payload; } // Actualiza inmutablemente
            })
            .addCase(onUpdateStudent.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message || 'Error al actualizar alumno.';
            })
            // Borrar
            .addCase(onDeleteStudent.pending, (state) => { state.status = 'loading'; })
            .addCase(onDeleteStudent.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.list = state.list.filter(student => student.id !== action.payload); // filter es inmutable
            })
            .addCase(onDeleteStudent.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message || 'Error al borrar alumno.';
            });
    }
})

//export const { } = studentSlice.actions