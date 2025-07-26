// src/store/api/apiSlice.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Función para obtener el token de donde lo almacenes (localStorage, cookies, etc.)
const getTokenFromState = (getState) => {
    return getState().auth.token;
};

export const apiSlice = createApi({
    reducerPath: 'api', // Nombre de la sección de la store para este API
    baseQuery: fetchBaseQuery({
        baseUrl: 'http://localhost:8080', // Tu URL base del backend
        prepareHeaders: (headers, { getState }) => {
            const token = getTokenFromState(getState); // Obtiene el token del estado de Redux
            if (token) {
                headers.set('Authorization', `Bearer ${token}`);
            }
            if (!headers.has('Content-Type') || headers.get('Content-Type') === 'application/json') {}
            //headers.set('Content-Type', 'application/json');
            return headers;
        },
    }),
    // Tags para invalidación de caché (importante para actualizar listas después de cambios)
    tagTypes: ['Student','User'], // Definimos un tag para los estudiantes
    endpoints: (builder) => ({
        getAreas: builder.query({
            query: () => '/areas',
            staleTime: Infinity,
            cacheTime: Infinity,
            providesTime: ['Area'],
            transformResponse: (response) => response,
        }),
        getCurrentCycle: builder.query({
            query: () => '/cycles/current',
            staleTime: Infinity,
            cacheTime: Infinity,
            providesTime: ['Cycle'],
            transformResponse: (response) => response,
        }),
        getCurrentStage: builder.query({
            query: () => '/stages/current',
            staleTime: Infinity,
            cacheTime: Infinity,
            providesTime: ['Stage'],
            transformResponse: (response) => response,
        })
    }),
});

export const {useGetAreasQuery, useGetCurrentCycleQuery, useGetCurrentStageQuery} = apiSlice;