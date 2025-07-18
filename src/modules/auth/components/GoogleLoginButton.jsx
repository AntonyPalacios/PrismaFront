import {useDispatch} from 'react-redux';
import {toggleAlert} from "../../../store/slices/alert/alertSlice.js";
import {MyButton} from "../../../components/ui/index.js";
import {useGoogleLogin} from "@react-oauth/google";
// No necesitas useNavigate aquí, la redirección la maneja el backend y el OAuth2RedirectHandler

export const GoogleLoginButton = () => {
    const dispatch = useDispatch();

    const onSuccess = async (credentialResponse) => {
        console.log('Google Login Success (ID Token received by frontend):', credentialResponse);
        // En este flujo, Spring Boot ya maneja el intercambio del ID Token de Google
        // y redirige al frontend con tu JWT.
        // Por lo tanto, no necesitas hacer nada más aquí.
        // La redirección a tu backend (http://localhost:8080/oauth2/authorization/google)
        // es lo que realmente inicia el flujo del lado del servidor.
        // El componente GoogleLogin de @react-oauth/google se encarga de redirigir al usuario a Google.
        // Si llegamos a onSuccess, significa que Google autenticó al usuario.
        // El siguiente paso es que Google redirija a tu backend.
        // No despaches alerta de éxito aquí, espera la respuesta de tu backend.
    };


    const handleGoogleLoginClick = () => {
        // Esta es la URL que Spring Security expone para iniciar el flujo de OAuth2 con Google
        // Al redirigir el navegador aquí, Spring Security se encarga del resto del flujo
        // con Google y luego redirige de vuelta a tu frontend con el JWT.
        window.location.href = "http://localhost:8080/oauth2/authorization/google";
        // login()

    };
    const onFailure = (errorResponse) => {
        console.error('Google Login Failed:', errorResponse);
        dispatch(toggleAlert({ message: 'Fallo al iniciar sesión con Google', severity: 'error' }));

    };

    return (
        <div>
            <h3>Inicia sesión con Google</h3>
            {/*<GoogleLogin
                onSuccess={onSuccess}
                onError={onFailure}
                // Puedes personalizar el botón con 'useGoogleLogin' hook
                // y un botón personalizado si no quieres el botón por defecto de Google.
            />*/}
            <MyButton
                variant="contained"
                color="primary"
                onClick={handleGoogleLoginClick}

            >
                <img
                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/1024px-Google_%22G%22_logo.svg.png"
                    alt="Google logo" style={{width: '20px', height: '20px'}}/>
                Iniciar sesión
            </MyButton>
        </div>
    );
};
