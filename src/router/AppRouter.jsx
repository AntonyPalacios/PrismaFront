import {Navigate, Route, Routes} from "react-router";
import {AuthRouter} from "../auth/routes/AuthRouter.jsx";
import {PrismaRouter} from "./PrismaRouter.jsx";

export const AppRouter = () => {
    return (
        <>
            <Routes>
                <Route path="/" element={<Navigate to="/login"/>} />
                <Route path="login" element={<AuthRouter/>} />
                <Route path="/*" element={<PrismaRouter/>} />
            </Routes>
        </>
    );
};
