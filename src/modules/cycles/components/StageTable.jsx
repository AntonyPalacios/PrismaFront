import {MyFab} from "../../../components/ui/MyFab.jsx";
import {useModal} from "../../../hooks/useModal.js";
import MyModal from "../../../components/ui/MyModal.jsx";
import {StageForm} from "./StageForm.jsx";
import {Grid, Paper} from "@mui/material";
import TableContainer from "@mui/material/TableContainer";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableBody from "@mui/material/TableBody";
import {useState} from "react";
import {useGetStagesQuery} from "../../../store/slices/cycle/cycleApiSlice.js";
import {useDispatch} from "react-redux";
import {resetSelectedStage, setSelectedStage} from "../../../store/slices/cycle/cycleSlice.js";

export const StageTable = ({idCycle}) => {
    const {open, toggleModal, title} = useModal({title: "Etapa"});

    const dispatch = useDispatch();

    const {data: stages = []} = useGetStagesQuery(idCycle);

    const [disabled, setDisabled] = useState(true)
    const toggleForm = () => {
        setDisabled(!disabled);
    }

    const onClickStage = (stage) => {
        dispatch(setSelectedStage(stage));
        setDisabled(true)
        toggleModal();
    }

    const onClickFab = () => {
        dispatch(resetSelectedStage(idCycle));
        setDisabled(false);
        toggleModal();
    }


    return (
        <>
            <Grid container spacing={2}>
                <Grid size={12} sx={{flexGrow: 1}}>
                    <TableContainer component={Paper} sx={{width: '100%', overflowX: 'auto'}}>
                        <Table sx={{width: '100%', tableLayout: 'fixed'}}>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{width: '110px'}} align="left">Nombre</TableCell>
                                    <TableCell sx={{width: '150px'}} align="left">Fecha Inicio</TableCell>
                                    <TableCell sx={{width: '150px'}} align="left">Fecha Fin</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {stages.map((stage) => {
                                    return (
                                        <TableRow hover key={stage.id} onClick={() => {
                                            onClickStage(stage)
                                        }}>
                                            <TableCell sx={{
                                                whiteSpace: 'normal',
                                                wordBreak: 'break-word'
                                            }} align="left">{stage.name}</TableCell>
                                            <TableCell sx={{
                                                whiteSpace: 'normal',
                                                wordBreak: 'break-word'
                                            }} align="left">{stage.startDate}</TableCell>
                                            <TableCell sx={{
                                                whiteSpace: 'normal',
                                                wordBreak: 'break-word',
                                            }} align="left">{stage.endDate}</TableCell>
                                        </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Grid>
            </Grid>
            <MyFab onHandleCLick={onClickFab}/>
            {open ? <MyModal
                open={open}
                toggleModal={onClickFab}
                title={title}
                content={
                    <StageForm disabled={disabled}
                               onCloseForm={toggleModal}
                               toggleForm={toggleForm}/>
                }
            /> : null}

        </>
    );
};
