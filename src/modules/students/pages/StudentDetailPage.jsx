import {useParams} from "react-router";

import {MyTitle} from "../../../components/ui/index.js";
import {StudentForm} from "../components/StudentForm.jsx";
import {useContext, useState} from "react";
import {Grid} from "@mui/material";
import {StudentContext} from "../../../context/StudentContext.jsx";
import {MyAlert} from "../../../components/ui/MyAlert.jsx";

export const StudentDetailPage = () => {
    const {id} = useParams();
    /*useEffect(() => {
        //obtener student por id desde el backend

    },[id])*/
    const {state:{students,studentAlert}, onToggleAlert} = useContext(StudentContext);
    const student = students.find((student) => student.id === parseInt(id));
    const [disabled, setDisabled] = useState(true)


    const toggleForm = () => {
        setDisabled(!disabled);
    }
    return (
            <Grid container spacing={2}>
                <Grid width="100%">
                    <MyTitle>Alumnos</MyTitle>
                </Grid>
                <Grid width="100%">
                    <StudentForm student={student} action="edit" disabled={disabled} toggleForm={toggleForm}/>
                </Grid>
                <MyAlert
                    message={studentAlert.message}
                    severity={studentAlert.severity}
                    open={studentAlert.open}
                    onHandleClose={onToggleAlert}
                />

            </Grid>
    );
};
