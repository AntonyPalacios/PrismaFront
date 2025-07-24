// src/features/students/studentsApiSlice.js
import { apiSlice } from '../api/apiSlice.js'; // Importa tu slice base

export const studentsApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        // GET (Listar todos los estudiantes)
        getStudents: builder.query({
            query: (stageId) => {
                // Si se proporciona un stageId (y no es 0 o vacío), lo añade como query parameter
                if (stageId && stageId !== -1) {
                    return `/students?stageId=${stageId}`;
                }
                return '/students';
            }, // Endpoint GET a http://localhost:8080/students
            providesTags: ['Student'], // Marca que esta query provee datos para el tag 'Student'
            transformResponse: (response) => {
                return response.map(student => {
                    if(student.tutorId === null) student.tutorId = 0;
                    if(student.areaId === null) student.areaId = 0;
                    student.isActive? student.isActive = 1:student.isActive = 2;
                    return student;
                });
            },
            transformErrorResponse: (response) => {
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
                return response.data || 'Error desconocido al crear alumno.';
            },
        }),

        // PATCH (Actualizar un estudiante)
        updateStudent: builder.mutation({
            query: (updatedStudent) => ({
                url: `/students/${updatedStudent.id}`, // Asume que el ID está en el objeto
                method: 'PUT',
                body: updatedStudent,
            }),
            invalidatesTags: ['Student'], // Invalida la caché para refrescar la lista
            transformErrorResponse: (response) => {
                return response.data || 'Error desconocido al actualizar alumno.';
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
                return response.data || 'Error desconocido al borrar alumno.';
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