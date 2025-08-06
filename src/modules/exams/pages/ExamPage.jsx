import {Grid} from "@mui/material";
import {MyTitle} from "../../../components/ui/index.js";
import {ExamFilter} from "../components/ExamFilter.jsx";
import {ExamTable} from "../components/ExamTable.jsx";
import {MyFab} from "../../../components/ui/MyFab.jsx";
import MyModal from "../../../components/ui/MyModal.jsx";
import {useModal} from "../../../hooks/useModal.js";
import {ExamForm} from "../components/ExamForm.jsx";
import {useDispatch, useSelector} from "react-redux";
import {useGetExamsQuery} from "../../../store/slices/exam/examApiSlice.js";
import {resetSelectedExam} from "../../../store/slices/exam/examSlice.js";

export const ExamPage = () => {
    const {open, toggleModal, title} = useModal({title: "Nuevo Exámen"});
    const {stageId, cycleId} = useSelector(state => state.exam.examFilter);
    const {currentStage} = useSelector(state => state.cycle)
    const dispatch = useDispatch();
    const onHandleClickFab = ()=>{
        dispatch(resetSelectedExam(currentStage.id))
        toggleModal()
    }
    const {data: examList, isLoading} = useGetExamsQuery({cycleId, stageId}, {
        skip: !stageId
    });
    return (
        <Grid container spacing={2}>
            <Grid size={12}>
                <MyTitle>Exámenes</MyTitle>
            </Grid>
            <Grid width="100%">
                <ExamFilter/>
            </Grid>
            <ExamTable exams={examList} isLoading={isLoading}/>

            <MyFab onHandleCLick={onHandleClickFab}/>
            <MyModal
                open={open}
                toggleModal={onHandleClickFab}
                title={title}
                content={<ExamForm onCloseForm={onHandleClickFab}/>}
            />
        </Grid>
    );
};
