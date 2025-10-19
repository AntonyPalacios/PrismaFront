import {apiSlice} from "../api/apiSlice.js";

export const examApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) =>({
        getExams: builder.query({
            query: ({cycleId, stageId}) => {
                if (stageId !== -1 && stageId !== null && stageId !== undefined) {
                    return `exams?stageId=${stageId}`;
                }
                if (cycleId !== -1 && cycleId !== null && cycleId !== undefined) {
                    return `exams?cycleId=${cycleId}`;
                }
            },
            providesTags:['Exam']
        }),
        createExam: builder.mutation({
            query: (newExam) => ({
                url: '/exams',
                method: 'POST',
                body: newExam, // RTK Query ya serializa esto a JSON por ti
            }),
            // Invalidar caché para que la lista de estudiantes se actualice automáticamente
            invalidatesTags: ['Exam'],
            transformErrorResponse: (response) => {
                return response.data || 'Error desconocido al crear exámen.';
            },
        }),
        updateExam: builder.mutation({
            query: (updatedExam) => ({
                url: `/exams/${updatedExam.id}`,
                method: 'PUT',
                body: updatedExam, // RTK Query ya serializa esto a JSON por ti
            }),
            // Invalidar caché para que la lista de estudiantes se actualice automáticamente
            invalidatesTags: ['Exam'],
            transformErrorResponse: (response) => {
                return response.data || 'Error desconocido al actualizar exámen.';
            },
        }),
        deleteExam: builder.mutation({
            query: (examId) => ({
                url: `/exams/${examId}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Exam'], // Invalida la caché para refrescar la lista
            transformErrorResponse: (response) => {
                return response.data || 'Error desconocido al borrar exámen.';
            },
        }),
        getExamResult: builder.query({
            query: ({studentId, cycleId}) => {
                return `/exams/results/${studentId}/${cycleId}`
            },
            providesTags:['Exam']
        }),
        getExamEffective: builder.query({
            query: ({studentId, cycleId}) => {
                return `/exams/effective/${studentId}/${cycleId}`
            },
            providesTags:['Exam']
        }),
        getExamEffectiveByCourse: builder.query({
            query: ({studentId, cycleId}) => {
                return `/exams/course/${studentId}/${cycleId}`
            },
            providesTags:['Exam']
        }),
        getExamResultsByUser: builder.query({
            query: ({areaId, userId, cycleId}) => {
                return `/exams/summary/${areaId}/${userId}/${cycleId}`
            },
            providesTags:['Exam']
        }),
        importExam: builder.mutation({
            query: ({formData,examId,area}) => ({
                url: `/exams/import/${examId}/${area}`,
                method: 'POST',
                body: formData,
            }),
            invalidatesTags: ['Exam'],
            transformErrorResponse: (response) => {
                return response.data || 'Error desconocido al importar exámen.';
            }
        }),

    })
})

export const {
    useGetExamsQuery,
    useCreateExamMutation,
    useUpdateExamMutation,
    useDeleteExamMutation,
    useGetExamResultQuery,
    useGetExamEffectiveQuery,
    useGetExamEffectiveByCourseQuery,
    useGetExamResultsByUserQuery,
    useImportExamMutation,
} = examApiSlice