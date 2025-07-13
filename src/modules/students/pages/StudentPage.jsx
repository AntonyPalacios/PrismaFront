import {Grid} from "@mui/material";
import {MyTitle} from "../../../components/ui/MyTitle.jsx";
import {StudentTable} from "../components/StudentTable.jsx";
import {StudentFilter} from "../components/StudentFilter.jsx";
import StudentFAB from "../components/StudentFAB.jsx";
import {MyAlert} from "../../../components/ui/MyAlert.jsx";
import {useDispatch, useSelector} from "react-redux";
import {toggleAlert} from "../../../store/slices/alert/alertSlice.js";

export const StudentPage = () => {

    const {message,severity,open} = useSelector(state => state.alert);

    const dispatch = useDispatch();

    return (
        <Grid container spacing={2}>
            <Grid width="100%">
                <MyTitle>Alumnos</MyTitle>
            </Grid>
            <StudentFilter/>
            <StudentTable/>
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
