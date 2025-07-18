// src/store/slices/auth/authSlice.js
import { createSlice } from '@reduxjs/toolkit';
import { jwtDecode } from 'jwt-decode'; // Importa la librería para decodificar JWT

const initialState = {
    token: localStorage.getItem('authToken') || null, // Intenta cargar el token del localStorage
    isAuthenticated: false, // Se determinará después de decodificar el token
    user: null, // Información básica del usuario (email, nombre)
    roles: [], // Roles del usuario
};

// Intenta decodificar el token al inicio si ya existe en localStorage
if (initialState.token) {
    try {
        const decodedToken = jwtDecode(initialState.token);
        // Verificar si el token no ha expirado
        const currentTime = Date.now() / 1000; // Tiempo actual en segundos
        if (decodedToken.exp > currentTime) {
            initialState.isAuthenticated = true;
            initialState.user = { email: decodedToken.sub, name: decodedToken.name }; // 'sub' es el email
            initialState.roles = decodedToken.roles || []; // Extrae los roles del claim 'roles'
        } else {
            // Token expirado
            localStorage.removeItem('authToken');
            initialState.token = null;
        }
    } catch (error) {
        console.error("Error decoding stored token:", error);
        // Si el token es inválido, limpia el estado
        localStorage.removeItem('authToken');
        initialState.token = null;
    }
}

export const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setCredentials: (state, action) => {
            const { token } = action.payload;
            state.token = token;
            state.isAuthenticated = true;
            localStorage.setItem('authToken', token);

            // Decodifica el token para obtener el email y los roles
            try {
                const decodedToken = jwtDecode(token);
                state.roles = decodedToken.roles || []; // Asigna los roles del token
            } catch (error) {
                console.error("Error decoding token on setCredentials:", error);
                state.user = null;
                state.roles = [];
                state.token = null;
                state.isAuthenticated = false;
                localStorage.removeItem('authToken');
            }
        },
        setCurrentUser: (state, action) => {
            state.user = action.payload;
        },
        logout: (state) => {
            state.token = null;
            state.user = null;
            state.isAuthenticated = false;
            state.roles = []; // Limpia los roles al cerrar sesión
            localStorage.removeItem('authToken'); // Elimina el token del localStorage
        },
    },
});

export const { setCredentials, logout, setCurrentUser } = authSlice.actions;
