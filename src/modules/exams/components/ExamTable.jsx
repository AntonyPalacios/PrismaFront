import {CircularProgress, Grid, Paper} from "@mui/material";
import TableContainer from "@mui/material/TableContainer";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableBody from "@mui/material/TableBody";
import MyModal from "../../../components/ui/MyModal.jsx";
import {useModal} from "../../../hooks/useModal.js";
import {ExamForm} from "./ExamForm.jsx";
import {useState} from "react";
import {ExamImport} from "./ExamImport.jsx";
import {useDispatch} from "react-redux";
import {setSelectedExam} from "../../../store/slices/exam/examSlice.js";


export const ExamTable = ({exams=[], isLoading}) => {

    const {open,toggleModal, title} = useModal({title: "Exámen"});

    const dispatch = useDispatch();

    const [disabled, setDisabled] = useState(true)
    const toggleForm = () => {
        setDisabled(!disabled);
    }

    const onClickExam = (exam) => {
        dispatch(setSelectedExam(exam));
        setDisabled(true)
        toggleModal();
    }
    return (
        <Grid container spacing={2}>
            <Grid size={12} sx={{ flexGrow: 1 }}>
                {isLoading ? (
                        <CircularProgress/>
                    ) :
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
                                    <TableRow hover key={exam.id} onClick={() => {onClickExam(exam)}}>
                                        <TableCell sx={{whiteSpace: 'normal',
                                            wordBreak: 'break-word'}} align="left">{exam.name}</TableCell>
                                        <TableCell sx={{whiteSpace: 'normal',
                                            wordBreak: 'break-word'}} align="left">{exam.stage}</TableCell>
                                        <TableCell sx={{whiteSpace: 'normal',
                                            wordBreak: 'break-word',}} align="left">{exam.cycle}</TableCell>
                                        <TableCell sx={{whiteSpace: 'normal',
                                            wordBreak: 'break-word',}} align="left">{exam.date}</TableCell>
                                    </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>}
            </Grid>
            {open ?<MyModal
                open={open}
                toggleModal={toggleModal}
                title={title}

                content={
                <Grid container spacing={2}>
                    <ExamForm disabled={disabled}
                              onCloseForm={toggleModal}
                              toggleForm={toggleForm}/>
                    <ExamImport onCloseForm={toggleModal} />
                </Grid>

                }
            />:null}
        </Grid>
    );
};
