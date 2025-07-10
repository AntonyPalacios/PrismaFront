import {CircularProgress, Grid, Paper} from "@mui/material";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";

import {useNavigate} from "react-router";
import {getAreaById} from "../../../helper/getAreaById.js";
import {getTutorById} from "../../../helper/getTutorById.js";
import {useDispatch, useSelector} from "react-redux";
import {useEffect} from "react";
import {fetchStudents} from "../../../store/slices/student/studentSlice.js";


export const StudentTable = () => {


    const {list, status} = useSelector((state) => state.student)
    const dispatch = useDispatch();

    useEffect(() => {
        // Cargar estudiantes cuando el componente se monte por primera vez
        if (status === 'idle') {
            dispatch(fetchStudents());
        }
    }, [dispatch, status]);


    const navigate = useNavigate();
    const onClickStudent = (id) => {
        navigate(`/students/${id}`);
    }

    return (
        <Grid container spacing={2}>
            <Grid size={12} sx={{ flexGrow: 1 }}>
                {status === 'loading' ? (
                        <CircularProgress />
                ):
                <TableContainer component={Paper} sx={{width:'100%', overflowX: 'auto'}} >
                    <Table sx={{width:'100%', tableLayout: 'fixed'}}>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{width:'110px'}} align="left">Nombre</TableCell>
                                <TableCell sx={{width:'150px'}} align="left">Área</TableCell>
                                <TableCell sx={{width:'150px'}} align="left">Correo</TableCell>
                                <TableCell sx={{width:'150px'}} align="left">Tutor</TableCell>
                                <TableCell sx={{width:'150px'}} align="left">Activo</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {list.map((student) => {
                                return (
                                    <TableRow hover key={student.id} onClick={() => {onClickStudent(student.id)}}>
                                        <TableCell sx={{whiteSpace: 'normal',
                                            wordBreak: 'break-word'}} align="left">{student.name}</TableCell>
                                        <TableCell sx={{whiteSpace: 'normal',
                                            wordBreak: 'break-word'}} align="left">{getAreaById(student.areaId)?.name}</TableCell>
                                        <TableCell sx={{whiteSpace: 'normal',
                                            wordBreak: 'break-word',}} align="left">{student.email}</TableCell>
                                        <TableCell sx={{whiteSpace: 'normal',
                                            wordBreak: 'break-word',}} align="left">{getTutorById(student.tutorId)?.name}</TableCell>
                                        <TableCell sx={{whiteSpace: 'normal',
                                            wordBreak: 'break-word',}} align="left">{student.active?"Sí":"No"}</TableCell>
                                    </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
                }
            </Grid>

        </Grid>
    );
};
