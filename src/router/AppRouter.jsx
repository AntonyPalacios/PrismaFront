import {Navigate, Route, Routes} from "react-router";
import {AuthRouter} from "./AuthRouter.jsx";
import {PrismaRouter} from "./PrismaRouter.jsx";
import {useDispatch, useSelector} from "react-redux";
import {OAuth2RedirectHandler} from "../modules/auth/components/OAuth2RedirectHandler.jsx";
import {useGetCurrentUserQuery} from "../store/slices/user/userApiSlice.js";
import {useEffect} from "react";
import {setCurrentUser} from "../store/slices/auth/authSlice.js";

export const AppRouter = () => {

    const dispatch = useDispatch();
    const {data: currentUser,isSuccess:isSuccessCurrentUser} = useGetCurrentUserQuery();
    useEffect(() => {
        if(isSuccessCurrentUser){
            dispatch(setCurrentUser(currentUser));
        }
    },[currentUser, dispatch, isSuccessCurrentUser]);

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
