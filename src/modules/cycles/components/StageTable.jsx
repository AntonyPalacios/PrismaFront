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
import { stages} from "../../../assets/fakeData.jsx";
import {useEffect, useState} from "react";

export const StageTable = ({idCycle}) => {
    const {open, toggleModal} = useModal({});

    const [cycleStages, setCycleStages] = useState([])
    const [idStage, setIdStage] = useState(null)
    const [modalTitle, setModalTitle] = useState("Nueva Etapa");

    useEffect(() => {
        const stagesByCycle = stages.filter(stage => {
            return stage.cycle.id === idCycle
        })
        setCycleStages(stagesByCycle)
    },[idCycle]);

    const onClickStage = (id) =>{
        setIdStage(id);
        setModalTitle("Editar Etapa");
        toggleModal();
    }

    const onClickFab = () =>{
        setModalTitle("Nueva Etapa");
        toggleModal();
    }
    return (
        <>
            <Grid container spacing={2}>
                <Grid size={12} sx={{ flexGrow: 1 }}>
                    <TableContainer component={Paper} sx={{width:'100%', overflowX: 'auto'}} >
                        <Table sx={{width:'100%', tableLayout: 'fixed'}}>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{width:'110px'}} align="left">Nombre</TableCell>
                                    <TableCell sx={{width:'150px'}} align="left">Fecha Inicio</TableCell>
                                    <TableCell sx={{width:'150px'}} align="left">Fecha Fin</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {cycleStages.map((stage) => {
                                    return (
                                        <TableRow hover key={stage.id} onClick={() => {onClickStage(stage.id)}}>
                                            <TableCell sx={{whiteSpace: 'normal',
                                                wordBreak: 'break-word'}} align="left">{stage.name}</TableCell>
                                            <TableCell sx={{whiteSpace: 'normal',
                                                wordBreak: 'break-word'}} align="left">{stage.initDate}</TableCell>
                                            <TableCell sx={{whiteSpace: 'normal',
                                                wordBreak: 'break-word',}} align="left">{stage.endDate}</TableCell>
                                        </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Grid>
            </Grid>
            <MyFab onHandleCLick={toggleModal}/>
            <MyModal
                open={open}
                toggleModal={onClickFab}
                title={modalTitle}
                content={<StageForm id={idStage}/>}
            />
        </>
    );
};
