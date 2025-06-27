import {Route, Routes} from "react-router";
import {StudentPage} from "../students/pages/StudentPage.jsx";
import {UsersPage} from "../users/pages/UsersPage.jsx";
import {Box} from "@mui/material";
import {Navbar} from "../components/layout/Navbar.jsx";
import {useContext} from "react";
import {AppContext} from "../context/AppContext.jsx";
import {StudentList} from "../students/components/StudentList.jsx";
import {StudentDetail} from "../students/components/StudentDetail.jsx";

const drawerWidth = 240;
export const PrismaRouter = () => {

    const {isLargeScreen} = useContext(AppContext);
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
                    <Route path="students" element={<StudentPage/>}>
                        <Route index element={<StudentList />} />
                        <Route path=":id" element={<StudentDetail />} />
                    </Route>
                    <Route path="users" element={<UsersPage/>}/>
                </Routes>

            </Box>
        </>
    );
};
