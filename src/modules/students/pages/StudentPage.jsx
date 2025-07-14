import {Grid} from "@mui/material";
import {MyTitle} from "../../../components/ui/MyTitle.jsx";
import {StudentTable} from "../components/StudentTable.jsx";
import {StudentFilter} from "../components/StudentFilter.jsx";
import StudentFAB from "../components/StudentFAB.jsx";
import {MyAlert} from "../../../components/ui/MyAlert.jsx";
import {useDispatch, useSelector} from "react-redux";
import {toggleAlert} from "../../../store/slices/alert/alertSlice.js";
import {useGetStudentsQuery} from "../../../store/slices/student/studentsApiSlice.js";
import {useEffect} from "react";
import {selectFilteredStudents, setStudents} from "../../../store/slices/student/studentSlice.js";

export const StudentPage = () => {

    const {message,severity,open} = useSelector(state => state.alert);

    const dispatch = useDispatch();
    const {data: studentsList, isSuccess:isSuccessStudent, isLoading} = useGetStudentsQuery(); //

    //hace que siempre tenga la data cargada del backend
    useEffect(() => {
        if (isSuccessStudent && studentsList && studentsList.length > 0) { //
            console.log("Datos brutos de RTK Query:", studentsList); // <-- Añade este log
            dispatch(setStudents(studentsList)); //
        }
    }, [dispatch, isSuccessStudent, studentsList]);

    const students= useSelector(selectFilteredStudents);

    return (
        <Grid container spacing={2}>
            <Grid width="100%">
                <MyTitle>Alumnos</MyTitle>
            </Grid>
            <StudentFilter/>
            <StudentTable students={students} isLoading={isLoading} />
            <StudentFAB/>
            <MyAlert
                message={message}
                severity={severity}
                open={open}
                onHandleClose={()=>dispatch(toggleAlert())}
            />

        </Grid>
    );
};
