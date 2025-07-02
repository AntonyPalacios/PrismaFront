import {Grid} from "@mui/material";
import {MyTitle} from "../../../components/ui/MyTitle.jsx";
import {StudentTable} from "../components/StudentTable.jsx";
import {StudentFilter} from "../components/StudentFilter.jsx";
import StudentFAB from "../components/StudentFAB.jsx";
import {MyAlert} from "../../../components/ui/MyAlert.jsx";
import {useContext, useState} from "react";
import {StudentContext} from "../../../context/StudentContext.jsx";

export const StudentPage = () => {

    const {state:{studentAlert}, onToggleAlert} = useContext(StudentContext);


    return (
        <Grid container spacing={2}>
            <Grid width="100%">
                <MyTitle>Alumnos</MyTitle>
            </Grid>
            <StudentFilter/>
            <StudentTable/>
            <StudentFAB/>
            <MyAlert
                message={studentAlert.message}
                severity={studentAlert.severity}
                open={studentAlert.open}
                onHandleClose={onToggleAlert}
            />

        </Grid>
    );
};
