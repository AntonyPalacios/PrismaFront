import './styles/styles.css'
import {AppRouter} from "./router/AppRouter.jsx";
import {AppProvider} from "./context/AppProvider.jsx";
import {GoogleOAuthProvider} from "@react-oauth/google";

export const PrismaApp = () => {
    const GOOGLE_CLIENT_ID = "796230134807-05r2cu8klg833h0cg8mt5j83oa94e204.apps.googleusercontent.com"
    return (
        <>
            <AppProvider>
                <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
                    <AppRouter/>
                </GoogleOAuthProvider>
            </AppProvider>
        </>
    );
};



