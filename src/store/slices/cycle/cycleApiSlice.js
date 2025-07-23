import {apiSlice} from "../api/apiSlice.js";

export const cycleApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder)=>({
        getStages: builder.query({
            query: (cycleId) => `/stages?idCycle=${cycleId}`,
            providesTags:['Stage']
        }),
        getCycles: builder.query({
            query: () => '/cycles',
            providesTags: ['Cycle'],
            staleTime: Infinity,
            cacheTime: Infinity,
        }),
        createCycle: builder.mutation({
            query: (newCycle) => ({
                url: '/cycles',
                method: 'POST',
                body: newCycle, // RTK Query ya serializa esto a JSON por ti
            }),
            // Invalidar caché para que la lista de estudiantes se actualice automáticamente
            invalidatesTags: ['Cycle'],
            transformErrorResponse: (response) => {
                return response.data?.message || 'Error desconocido al crear ciclo.';
            },
        }),
        updateCycle: builder.mutation({
            query: (updatedCycle) => ({
                url: `/cycles/${updatedCycle.id}`, // Asume que el ID está en el objeto
                method: 'PUT',
                body: updatedCycle,
            }),
            invalidatesTags: ['Cycle'], // Invalida la caché para refrescar la lista
            transformErrorResponse: (response) => {
                return response.data?.message || 'Error desconocido al actualizar alumno.';
            },
        }),
        deleteCycle: builder.mutation({
            query: (cycleId) => ({
                url: `/cycles/${cycleId}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Cycle'], // Invalida la caché para refrescar la lista
            transformErrorResponse: (response) => {
                return response.data?.message || 'Error desconocido al borrar alumno.';
            },
        }),
        createStage: builder.mutation({
            query: (newStage) => ({
                url: '/stages',
                method: 'POST',
                body: newStage, // RTK Query ya serializa esto a JSON por ti
            }),
            // Invalidar caché para que la lista de estudiantes se actualice automáticamente
            invalidatesTags: ['Stage'],
            transformErrorResponse: (response) => {
                return response.data?.message || 'Error desconocido al crear ciclo.';
            },
        }),
        updateStage: builder.mutation({
            query: (updatedStage) => ({
                url: `/stages/${updatedStage.id}`, // Asume que el ID está en el objeto
                method: 'PUT',
                body: updatedStage,
            }),
            invalidatesTags: ['Stage'], // Invalida la caché para refrescar la lista
            transformErrorResponse: (response) => {
                return response.data?.message || 'Error desconocido al actualizar alumno.';
            },
        }),
        deleteStage: builder.mutation({
            query: (stageId) => ({
                url: `/stages/${stageId}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Stage'], // Invalida la caché para refrescar la lista
            transformErrorResponse: (response) => {
                return response.data?.message || 'Error desconocido al borrar alumno.';
            },
        }),
    })
})

export const {
    useGetStagesQuery,
    useGetCyclesQuery,
    useCreateCycleMutation,
    useUpdateCycleMutation,
    useDeleteCycleMutation,
    useCreateStageMutation,
    useUpdateStageMutation,
    useDeleteStageMutation,
} = cycleApiSlice;