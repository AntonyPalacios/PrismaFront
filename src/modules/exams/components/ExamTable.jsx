import {Grid, Paper} from "@mui/material";
import TableContainer from "@mui/material/TableContainer";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableBody from "@mui/material/TableBody";
import {exams} from "../../../assets/fakeData.jsx";
import MyModal from "../../../components/ui/MyModal.jsx";
import {useModal} from "../../../hooks/useModal.js";
import {ExamForm} from "./ExamForm.jsx";
import {useState} from "react";
import {MyTitle} from "../../../components/ui/index.js";
import {ExamImport} from "./ExamImport.jsx";

export const ExamTable = () => {

    const {open,toggleModal, title} = useModal({title: "Exámen"});
    const [id, setId] = useState(null)
    const onClickExam = (id) => {
        setId(id)
        toggleModal();
    }
    return (
        <Grid container spacing={2}>
            <Grid size={12} sx={{ flexGrow: 1 }}>
                <TableContainer component={Paper} sx={{width:'100%', overflowX: 'auto'}} >
                    <Table sx={{width:'100%', tableLayout: 'fixed'}}>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{width:'110px'}} align="left">Nombre</TableCell>
                                <TableCell sx={{width:'150px'}} align="left">Etapa</TableCell>
                                <TableCell sx={{width:'150px'}} align="left">Ciclo</TableCell>
                                <TableCell sx={{width:'150px'}} align="left">Fecha</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {exams.map((exam) => {
                                return (
                                    <TableRow hover key={exam.id} onClick={() => {onClickExam(exam.id)}}>
                                        <TableCell sx={{whiteSpace: 'normal',
                                            wordBreak: 'break-word'}} align="left">{exam.name}</TableCell>
                                        <TableCell sx={{whiteSpace: 'normal',
                                            wordBreak: 'break-word'}} align="left">{exam.stage.name}</TableCell>
                                        <TableCell sx={{whiteSpace: 'normal',
                                            wordBreak: 'break-word',}} align="left">{exam.stage.cycle.name}</TableCell>
                                        <TableCell sx={{whiteSpace: 'normal',
                                            wordBreak: 'break-word',}} align="left">{exam.date}</TableCell>
                                    </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Grid>
            <MyModal
                open={open}
                toggleModal={toggleModal}
                title={title}

                content={
                <Grid container spacing={2}>
                    <ExamForm id={id}/>
                    <ExamImport/>
                </Grid>

                }
            />
        </Grid>
    );
};
