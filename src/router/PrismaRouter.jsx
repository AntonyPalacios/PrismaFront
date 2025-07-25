import {Route, Routes} from "react-router";
import {StudentPage} from "../modules/students/pages/StudentPage.jsx";
import {UsersPage} from "../modules/users/pages/UsersPage.jsx";
import {Box} from "@mui/material";
import {Navbar} from "../components/layout/Navbar.jsx";
import {useContext} from "react";
import {AppContext} from "../context/AppContext.jsx";
import {UserDetailPage} from "../modules/users/pages/UserDetailPage.jsx";
import {CyclePage} from "../modules/cycles/pages/CyclePage.jsx";
import {CycleDetailPage} from "../modules/cycles/pages/CycleDetailPage.jsx";
import {ExamPage} from "../modules/exams/pages/ExamPage.jsx";
import {StudentDetailPage} from "../modules/students/pages/StudentDetailPage.jsx";
import {useLoadInitialData} from "../hooks/useLoadInitialData.js";

const drawerWidth = 240;
export const PrismaRouter = () => {

    const {isLargeScreen} = useContext(AppContext);
    useLoadInitialData();
    return (
        <>
            <Navbar/>
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    ml: isLargeScreen ? `${drawerWidth}px` : 0,
                    mt: isLargeScreen ? 0 : 8, // deja espacio si está el toolbar superior
                    p: 1,
                }}
            >

                <Routes>
                    <Route path="students">
                        <Route index  element={<StudentPage/>} />
                        <Route path=":id" element={<StudentDetailPage />} />
                    </Route>
                    <Route path="users">
                        <Route index element={<UsersPage/>} />
                        <Route path=":id" element={<UserDetailPage/>} />
                    </Route>
                    <Route path="cycles">
                        <Route index element={<CyclePage/>} />
                        <Route path=":id" element={<CycleDetailPage/>} />
                    </Route>
                    <Route path="exams">
                        <Route index element={<ExamPage/>} />
                    </Route>
                </Routes>

            </Box>
        </>
    );
};
