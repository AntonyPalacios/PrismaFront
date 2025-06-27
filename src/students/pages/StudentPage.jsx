import {Grid} from "@mui/material";
import {MyTitle} from "../../components/ui/MyTitle.jsx";
import {Outlet} from "react-router";

export const StudentPage = () => {


    return (
        <Grid container spacing={2}>
            <MyTitle>Alumnos</MyTitle>
            <Outlet/>
        </Grid>
    );
};
