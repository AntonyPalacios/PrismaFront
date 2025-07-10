// src/store/api/apiSlice.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Función para obtener el token de donde lo almacenes (localStorage, cookies, etc.)
const getToken = () => {
    // Asegúrate de que este es el lugar correcto donde guardas tu token
    return localStorage.getItem('authToken'); // O de una cookie, o de tu slice de autenticación
};

export const apiSlice = createApi({
    reducerPath: 'api', // Nombre de la sección de la store para este API
    baseQuery: fetchBaseQuery({
        baseUrl: 'http://localhost:8080', // Tu URL base del backend
        prepareHeaders: (headers, { getState }) => {
            // Añadir token de autorización si existe
            const token = getToken(); // O const token = getState().auth.token; si lo tienes en un slice de auth
            if (token) {
                headers.set('Authorization', `Bearer ${token}`);
            }
            // Asegúrate de enviar JSON
            headers.set('Content-Type', 'application/json');
            return headers;
        },
    }),
    // Tags para invalidación de caché (importante para actualizar listas después de cambios)
    tagTypes: ['Student'], // Definimos un tag para los estudiantes
    endpoints: (builder) => ({
        // Aquí se definirán tus endpoints específicos
        // Los veremos en el siguiente paso
    }),
});