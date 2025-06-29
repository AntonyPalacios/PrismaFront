import './styles/styles.css'
import {AppRouter} from "./router/AppRouter.jsx";
import {AppProvider} from "./context/AppProvider.jsx";

export const PrismaApp = () => {

    return (
        <>
            <AppProvider>
                <AppRouter/>
            </AppProvider>

        </>
    );
};



