// src/auth/routes/AuthRouter.jsx
import { Navigate, Route, Routes } from "react-router";
import {LoginPage} from "../modules/auth/pages/LoginPage.jsx";

export const AuthRouter = () => {
    return (
        <Routes>
            <Route index element={<LoginPage />} />
            {/* Puedes añadir otras rutas de autenticación aquí, ej. /register */}
            <Route path="*" element={<Navigate to="/" replace />} /> {/* Redirige a la raíz si la ruta no existe */}
        </Routes>
    );
};
