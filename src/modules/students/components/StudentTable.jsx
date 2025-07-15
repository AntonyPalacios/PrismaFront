import {CircularProgress, Grid, Paper} from "@mui/material";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";

import {useNavigate} from "react-router";
import {useGetNameById} from "../../../hooks/useGetNameById.js";


export const StudentTable = ({students, isLoading}) => {

    const {getAreaNameById,getTutorNameById} = useGetNameById();

    const navigate = useNavigate();
    const onClickStudent = (id) => {
        navigate(`/students/${id}`);
    }

    return (
        <Grid container spacing={2}>
            <Grid size={12} sx={{ flexGrow: 1 }}>
                {isLoading ? (
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
                            {students.map((student) => {
                                return (
                                    <TableRow hover key={student.id} onClick={() => {onClickStudent(student.id)}}>
                                        <TableCell sx={{whiteSpace: 'normal',
                                            wordBreak: 'break-word'}} align="left">{student.name}</TableCell>
                                        <TableCell sx={{whiteSpace: 'normal',
                                            wordBreak: 'break-word'}} align="left">{getAreaNameById(student.areaId)}</TableCell>
                                        <TableCell sx={{whiteSpace: 'normal',
                                            wordBreak: 'break-word',}} align="left">{student.email}</TableCell>
                                        <TableCell sx={{whiteSpace: 'normal',
                                            wordBreak: 'break-word',}} align="left">{getTutorNameById(student.tutorId)}</TableCell>
                                        <TableCell sx={{whiteSpace: 'normal',
                                            wordBreak: 'break-word',}} align="left">{student.isActive===1?"Sí":"No"}</TableCell>
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
