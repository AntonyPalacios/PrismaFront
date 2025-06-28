import {Navigate, Route, Routes} from "react-router";
import {LoginPage} from "../pages/LoginPage.jsx";

export const AuthRouter = () => {
    return (
        <>
            <Routes>
                <Route index element={<LoginPage/>} />
            </Routes>
        </>
    );
};
