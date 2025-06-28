import {Grid} from "@mui/material";
import {MyTitle} from "../../components/ui/MyTitle.jsx";
import {Outlet} from "react-router";
import {StudentProvider} from "../../context/StudentProvider.jsx";

export const StudentPage = () => {


    return (
        <StudentProvider>
            <Grid container spacing={2}>
                <MyTitle>Alumnos</MyTitle>
                <Outlet/>
            </Grid>
        </StudentProvider>
    );
};
