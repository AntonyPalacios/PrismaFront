// src/features/user/userApiSlice.js
import { apiSlice } from '../api/apiSlice.js'; // Importa tu slice base

export const userApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        // GET (Listar todos los estudiantes)
        getUser: builder.query({
            query: () => '/users', // Endpoint GET a http://localhost:8080/user
            providesTags: ['User'], // Marca que esta query provee datos para el tag 'User'
            transformResponse: (response) => {
                // Aquí puedes transformar la respuesta del backend si es necesario
                // Por ejemplo, si el backend devuelve { data: [], message: '' }, podrías retornar response.data
                // console.log("Backend response for getUser:", response);
                // Suponiendo que el backend devuelve un array de estudiantes directamente
                return response;
            },
            transformErrorResponse: (response) => {
                // Manejo de errores personalizados del backend
                return response.data?.message || 'Error desconocido al obtener usuarios.';
            },
        }),

        getCurrentUser: builder.query({
            query: () => '/users/current',
            providesTags: ['User'],

        }),

        // POST (Crear un nuevo estudiante)
        createUser: builder.mutation({
            query: (newUser) => ({
                url: '/users',
                method: 'POST',
                body: newUser, // RTK Query ya serializa esto a JSON por ti
            }),
            // Invalidar caché para que la lista de estudiantes se actualice automáticamente
            invalidatesTags: ['User'],
            transformErrorResponse: (response) => {
                return response.data || 'Error desconocido al crear alumno.';
            },
        }),

        updateUser: builder.mutation({
            query: (updatedUser) => ({
                url: `/users/${updatedUser.id}`, // Asume que el ID está en el objeto
                method: 'PUT',
                body: updatedUser,
            }),
            invalidatesTags: ['User'], // Invalida la caché para refrescar la lista
            transformErrorResponse: (response) => {
                return response.data || 'Error desconocido al actualizar alumno.';
            },
        }),
        deleteUser: builder.mutation({
            query: (studentId) => ({
                url: `/users/${studentId}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['User'], // Invalida la caché para refrescar la lista
            transformErrorResponse: (response) => {
                return response.data || 'Error desconocido al borrar alumno.';
            },
        }),
    }),
});

// RTK Query genera automáticamente hooks con los nombres de tus endpoints
export const {
    useGetUserQuery,
    useCreateUserMutation,
    useUpdateUserMutation,
    useDeleteUserMutation,
    useGetCurrentUserQuery,
} = userApiSlice;