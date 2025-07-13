import './styles/styles.css'
import {AppRouter} from "./router/AppRouter.jsx";
import {AppProvider} from "./context/AppProvider.jsx";
import {StudentProvider} from "./context/StudentProvider.jsx";
import {useLoadInitialData} from "./hooks/useLoadInitialData.js";

export const PrismaApp = () => {

    useLoadInitialData();
    return (
        <>
            <AppProvider>
                <StudentProvider>
                        <AppRouter/>
                </StudentProvider>
            </AppProvider>

        </>
    );
};



