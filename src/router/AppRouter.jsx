import {Navigate, Route, Routes} from "react-router";
import {AuthRouter} from "./AuthRouter.jsx";
import {PrismaRouter} from "./PrismaRouter.jsx";
import {useSelector} from "react-redux";
import {OAuth2RedirectHandler} from "../modules/auth/components/OAuth2RedirectHandler.jsx";

export const AppRouter = () => {
    // Componente para proteger rutas
    const PrivateRoute = ({ children }) => {
        const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
        return isAuthenticated ? children : <Navigate to="/login" replace />;
    };
    return (
        <>
            <Routes>
                <Route path="/" element={<Navigate to="/login" />} />

                {/* Rutas de autenticación (públicas) */}
                <Route path="login/*" element={<AuthRouter />} /> {/* Contiene LoginPage */}
                <Route path="/oauth2/redirect" element={<OAuth2RedirectHandler />} /> {/* <-- Ruta para manejar la redirección */}

                <Route path="/*" element={<PrivateRoute><PrismaRouter/></PrivateRoute>} />
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </>
    );
};
