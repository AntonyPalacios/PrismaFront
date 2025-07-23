import {Grid} from "@mui/material";
import {MyTitle} from "../../../components/ui/index.js";
import {CycleTable} from "../components/CycleTable.jsx";
import MyModal from "../../../components/ui/MyModal.jsx";
import {useModal} from "../../../hooks/useModal.js";
import {CycleForm} from "../components/CycleForm.jsx";
import {MyFab} from "../../../components/ui/MyFab.jsx";
import {useGetCyclesQuery} from "../../../store/slices/cycle/cycleApiSlice.js";
import {useDispatch, useSelector} from "react-redux";
import {toggleAlert} from "../../../store/slices/alert/alertSlice.js";
import {MyAlert} from "../../../components/ui/MyAlert.jsx";


export const CyclePage = () => {

    const dispatch = useDispatch();
    const {open, toggleModal,title} = useModal({title : "Nuevo Ciclo"});
    const {message,severity,open:openAlert} = useSelector(state => state.alert);

    const {data: cycles, isLoading} = useGetCyclesQuery();


    return (
        <Grid container spacing={2}>
            <Grid width="100%">
                <MyTitle>Ciclos</MyTitle>
            </Grid>
            <Grid width="100%">
                <CycleTable cycles={cycles} isLoading={isLoading} />
            </Grid>
            <MyFab onHandleCLick={toggleModal}/>
            <MyModal
                open={open}
                toggleModal={toggleModal}
                title={title}
                content={<CycleForm onCloseForm={toggleModal}/>}
            />
            <MyAlert
                message={message}
                severity={severity}
                open={openAlert}
                onHandleClose={()=>dispatch(toggleAlert())}
            />
        </Grid>
    );
};
