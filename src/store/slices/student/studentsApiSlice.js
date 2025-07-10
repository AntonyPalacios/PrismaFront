// src/features/students/studentsApiSlice.js
import { apiSlice } from '../api/apiSlice.js'; // Importa tu slice base

export const studentsApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        // GET (Listar todos los estudiantes)
        getStudents: builder.query({
            query: () => '/students', // Endpoint GET a http://localhost:8080/students
            providesTags: ['Student'], // Marca que esta query provee datos para el tag 'Student'
            transformResponse: (response) => {
                // Aquí puedes transformar la respuesta del backend si es necesario
                // Por ejemplo, si el backend devuelve { data: [], message: '' }, podrías retornar response.data
                // console.log("Backend response for getStudents:", response);
                // Suponiendo que el backend devuelve un array de estudiantes directamente
                return response;
            },
            transformErrorResponse: (response) => {
                // Manejo de errores personalizados del backend
                return response.data?.message || 'Error desconocido al obtener alumnos.';
            },
        }),

        // POST (Crear un nuevo estudiante)
        createStudent: builder.mutation({
            query: (newStudent) => ({
                url: '/students',
                method: 'POST',
                body: newStudent, // RTK Query ya serializa esto a JSON por ti
            }),
            // Invalidar caché para que la lista de estudiantes se actualice automáticamente
            invalidatesTags: ['Student'],
            transformErrorResponse: (response) => {
                return response.data?.message || 'Error desconocido al crear alumno.';
            },
        }),

        // PATCH (Actualizar un estudiante)
        updateStudent: builder.mutation({
            query: (updatedStudent) => ({
                url: `/students/${updatedStudent.id}`, // Asume que el ID está en el objeto
                method: 'PATCH',
                body: updatedStudent,
            }),
            invalidatesTags: ['Student'], // Invalida la caché para refrescar la lista
            transformErrorResponse: (response) => {
                return response.data?.message || 'Error desconocido al actualizar alumno.';
            },
        }),

        // DELETE (Borrar un estudiante)
        deleteStudent: builder.mutation({
            query: (studentId) => ({
                url: `/students/${studentId}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Student'], // Invalida la caché para refrescar la lista
            transformErrorResponse: (response) => {
                return response.data?.message || 'Error desconocido al borrar alumno.';
            },
        }),
    }),
});

// RTK Query genera automáticamente hooks con los nombres de tus endpoints
export const {
    useGetStudentsQuery,
    useCreateStudentMutation,
    useUpdateStudentMutation,
    useDeleteStudentMutation,
} = studentsApiSlice;