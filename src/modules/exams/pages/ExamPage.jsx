import {Grid} from "@mui/material";
import {MyTitle} from "../../../components/ui/index.js";
import {ExamFilter} from "../components/ExamFilter.jsx";
import {ExamTable} from "../components/ExamTable.jsx";
import {MyFab} from "../../../components/ui/MyFab.jsx";
import MyModal from "../../../components/ui/MyModal.jsx";
import {useModal} from "../../../hooks/useModal.js";
import {ExamForm} from "../components/ExamForm.jsx";

export const ExamPage = () => {
    const {open,toggleModal, title} = useModal({title: "Nuevo Exámen"});
    return (
        <Grid container spacing={2}>
            <Grid size={12}>
                <MyTitle>Exámenes</MyTitle>
            </Grid>
            <Grid width="100%">
                <ExamFilter/>
            </Grid>
            <ExamTable/>

            <MyFab onHandleCLick={toggleModal}/>
            <MyModal
                open={open}
                handleClose={toggleModal}
                title={title}
                content={<ExamForm/>}
            />
        </Grid>
    );
};
