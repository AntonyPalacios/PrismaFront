import './styles/styles.css'
import {AppRouter} from "./router/AppRouter.jsx";
import {AppProvider} from "./context/AppProvider.jsx";
import {StudentProvider} from "./context/StudentProvider.jsx";
import {UserProvider} from "./context/UserProvider.jsx";

export const PrismaApp = () => {

    return (
        <>
            <AppProvider>
                <StudentProvider>
                    <UserProvider>
                        <AppRouter/>
                    </UserProvider>
                </StudentProvider>
            </AppProvider>

        </>
    );
};



