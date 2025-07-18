import {useEffect} from 'react';
import {useDispatch} from 'react-redux';
import {setCredentials} from '../../../store/slices/auth/authSlice.js';
import {toggleAlert} from '../../../store/slices/alert/alertSlice.js';
import {useNavigate, useSearchParams} from "react-router";

export const OAuth2RedirectHandler = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const dispatch = useDispatch();

    useEffect(() => {
        const token = searchParams.get('token');
        const error = searchParams.get('error');

        if (token) {
            dispatch(setCredentials({ token })); // Guarda el token y decodifica roles
            dispatch(toggleAlert({ message: 'Inicio de sesión exitoso', severity: 'success' }));
            navigate('/students', { replace: true }); // Redirige a una página protegida
        } else if (error) {
            dispatch(toggleAlert({ message: `Error de autenticación: ${error}`, severity: 'error' }));
            navigate('/login', { replace: true }); // Redirige a la página de login
        } else {
            dispatch(toggleAlert({ message: 'Redirección OAuth2 incompleta', severity: 'error' }));
            navigate('/login', { replace: true });
        }
    }, [searchParams, navigate, dispatch]);

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            Cargando autenticación...
        </div>
    );
};
