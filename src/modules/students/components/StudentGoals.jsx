import {Grid} from "@mui/material";
import {MySelect, MyTitle} from "../../../components/ui/index.js";
import {ExamGoalsByStudent} from "./ExamGoalsByStudent.jsx";

export const StudentGoals = () => {
    return (
        <Grid container spacing={2} width="100%">
            <Grid size={12}>
                <MyTitle>Metas</MyTitle>
            </Grid>
            <Grid size={12} >
                <ExamGoalsByStudent/>
            </Grid>
        </Grid>
    );
};
