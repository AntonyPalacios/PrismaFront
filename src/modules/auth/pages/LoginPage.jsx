
import {GoogleLoginButton} from "../components/GoogleLoginButton.jsx";

export const LoginPage = () => {

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', gap: '20px' }}>
            <h1>Iniciar Sesión</h1>
            <GoogleLoginButton />

        </div>
    );
};
