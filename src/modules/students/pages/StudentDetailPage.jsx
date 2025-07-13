import {useParams} from "react-router";

import {MyTitle} from "../../../components/ui/index.js";
import {StudentForm} from "../components/StudentForm.jsx";
import {useCallback, useEffect, useState} from "react";
import {Grid} from "@mui/material";
import {MyAlert} from "../../../components/ui/MyAlert.jsx";
import {StudentGraphics} from "../components/StudentGraphics.jsx";
import {useDispatch, useSelector} from "react-redux";
import {toggleAlert} from "../../../store/slices/alert/alertSlice.js";
import {fetchStudents} from "../../../store/slices/student/studentSlice.js";

export const StudentDetailPage = () => {
    const {id} = useParams();
    /*useEffect(() => {
        //obtener student por id desde el backend

    },[id])*/

    const {list,status:studentStatus} = useSelector(state => state.student);
    const {message,severity,open} = useSelector(state => state.alert);

    const dispatch = useDispatch();

    // Cargar estudiantes ya que si no hay nada, no puede buscar al alumno
    useEffect(() => {
        if (list.length === 0) { // O si studentsList.length === 0
            dispatch(fetchStudents());
        }
    }, [dispatch, studentStatus]);

    const student = list.find((student) => student.id === parseInt(id));
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
                    <StudentForm student={student} action="edit" disabled={disabled} toggleForm={toggleForm} />
                </Grid>
                <StudentGraphics/>
                <MyAlert
                    message={message}
                    severity={severity}
                    open={open}
                    onHandleClose={()=>dispatch(toggleAlert())}
                />

            </Grid>
    );
};
