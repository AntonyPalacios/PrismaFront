import {Navigate, Route, Routes} from "react-router";
import {LoginPage} from "../auth/pages/LoginPage.jsx";
import {StudentPage} from "../students/pages/StudentPage.jsx";
import Sidebar from "../components/layout/Sidebar.jsx";
import {UsersPage} from "../users/pages/UsersPage.jsx";
import {Box, Grid} from "@mui/material";
import {Navbar} from "../components/layout/Navbar.jsx";

export const PrismaRouter = () => {
    return (
        <>
            <Navbar/>
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    ml: '200px',

                }}>

                <Routes>
                    <Route path="students" element={<StudentPage/>}/>
                    <Route path="users" element={<UsersPage/>}/>
                </Routes>

            </Box>
        </>
    );
};
