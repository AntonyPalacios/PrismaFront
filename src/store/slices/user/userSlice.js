import { createSlice} from '@reduxjs/toolkit';


const initialState = {
    tutorList:[]
}

export const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: { //aca solo van los reducers síncronos
        setTutorList: (state,action) => {
            state.tutorList = action.payload.filter(user => user.isTutor)
        },
    },
    /*extraReducers:(builder) => { //para reducers asíncronos que tengan que ver con el estado
        builder
            // Listar
            .addCase(fetchUsers.pending, (state) => { state.status = 'loading'; })
            .addCase(fetchUsers.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.list = action.payload; // Usa push directamente con Immer
            })
            .addCase(fetchUsers.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message || 'Error al cargar usuarios.';
            })
            // Crear
            .addCase(onCreateUser.pending, (state) => { state.status = 'loading'; })
            .addCase(onCreateUser.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.list.push(action.payload); // Usa push directamente con Immer
            })
            .addCase(onCreateUser.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message || 'Error al crear usuario.';
            })
            // Actualizar
            .addCase(onUpdateUser.pending, (state) => { state.status = 'loading'; })
            .addCase(onUpdateUser.fulfilled, (state, action) => {
                state.status = 'succeeded';
                const index = state.list.findIndex(user => user.id === action.payload.id);
                if (index !== -1) { state.list[index] = action.payload; } // Actualiza inmutablemente
            })
            .addCase(onUpdateUser.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message || 'Error al actualizar usuario.';
            })
            // Borrar
            .addCase(onDeleteUser.pending, (state) => { state.status = 'loading'; })
            .addCase(onDeleteUser.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.list = state.list.filter(user => user.id !== action.payload); // filter es inmutable
            })
            .addCase(onDeleteUser.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message || 'Error al borrar usuario.';
            });
    }*/
})

export const { setTutorList} = userSlice.actions