import {Fab, Grid} from "@mui/material";
import {MyTitle} from "../../../components/ui/index.js";
import {CycleTable} from "../components/CycleTable.jsx";
import AddIcon from '@mui/icons-material/Add';
import MyModal from "../../../components/ui/MyModal.jsx";
import {useModal} from "../../../hooks/useModal.js";
import {CycleForm} from "../components/CycleForm.jsx";
import {MyFab} from "../../../components/ui/MyFab.jsx";


export const CyclePage = () => {

    const {open, toggleModal,title} = useModal({title : "Nuevo Ciclo"});

    return (
        <Grid container spacing={2}>
            <Grid width="100%">
                <MyTitle>Ciclos</MyTitle>
            </Grid>
            <Grid width="100%">
                <CycleTable />
            </Grid>
            <MyFab onOpen={toggleModal}/>
            <MyModal
                open={open}
                handleClose={toggleModal}
                title={title}
                content={
                <CycleForm/>
                }
            />
        </Grid>
    );
};
