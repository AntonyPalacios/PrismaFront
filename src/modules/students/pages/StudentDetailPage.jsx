import {useParams} from "react-router";

import {MyTitle} from "../../../components/ui/index.js";
import {StudentForm} from "../components/StudentForm.jsx";
import {useCallback, useContext, useState} from "react";
import {Grid} from "@mui/material";
import {StudentContext} from "../../../context/StudentContext.jsx";
import {MyAlert} from "../../../components/ui/MyAlert.jsx";
import {StudentGraphics} from "../components/StudentGraphics.jsx";

export const StudentDetailPage = () => {
    const {id} = useParams();
    /*useEffect(() => {
        //obtener student por id desde el backend

    },[id])*/
    const {state:{students,studentAlert}, onToggleAlert} = useContext(StudentContext);
    const student = students.find((student) => student.id === parseInt(id));
    const [disabled, setDisabled] = useState(true)


    const toggleForm = useCallback(() => {
        setDisabled(prevDisabled => !prevDisabled);
    }, []);
    return (
            <Grid container spacing={2}>
                <Grid width="100%">
                    <MyTitle>Alumnos</MyTitle>
                </Grid>
                <Grid width="100%">
                    <StudentForm student={student} action="edit" disabled={disabled} toggleForm={toggleForm}/>
                </Grid>
                <StudentGraphics/>
                <MyAlert
                    message={studentAlert.message}
                    severity={studentAlert.severity}
                    open={studentAlert.open}
                    onHandleClose={onToggleAlert}
                />

            </Grid>
    );
};
