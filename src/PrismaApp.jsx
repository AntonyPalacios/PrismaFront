import {useEffect} from "react";
import colors from "./assets/colors.js";
import './styles/styles.css'
import {AppRouter} from "./router/AppRouter.jsx";

export const PrismaApp = () => {
    useEffect(() => {
        const root = document.documentElement;
        Object.entries(colors).forEach(([key, value]) => {
            root.style.setProperty(`--color-${key}`, value);
        });
    }, []);
    return (
        <>
            <AppRouter></AppRouter>

        </>
    );
};



