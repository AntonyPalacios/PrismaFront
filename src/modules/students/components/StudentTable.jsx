import {CircularProgress, Grid, Paper, TablePagination} from "@mui/material";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";

import {useNavigate} from "react-router";
import {useGetNameById} from "../../../hooks/useGetNameById.js";
import {useState} from "react";


export const StudentTable = ({students, isLoading}) => {

    const {getAreaNameById, getTutorNameById} = useGetNameById();

    // State for pagination
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0); // Reset to the first page when rows per page changes
    };

    const navigate = useNavigate();
    const onClickStudent = (id) => {
        navigate(`/students/${id}`);
    }

    return (
        <Grid container spacing={2}>
            <Grid size={12} sx={{flexGrow: 1}}>
                {isLoading ? (
                        <CircularProgress/>
                    ) :
                    <TableContainer component={Paper} sx={{width: '100%', overflowX: 'auto'}}>
                        <Table sx={{width: '100%', tableLayout: 'fixed'}}>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{width: '200px'}} align="left">Nombre</TableCell>
                                    <TableCell sx={{width: '100px'}} align="left">Área</TableCell>
                                    <TableCell sx={{width: '150px'}} align="left">Correo</TableCell>
                                    <TableCell sx={{width: '120px'}} align="left">Tutor</TableCell>
                                    <TableCell sx={{width: '80px'}} align="left">Activo</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {students
                                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                    .map((student) => {
                                        return (
                                            <TableRow hover key={student.id} onClick={() => {
                                                onClickStudent(student.id)
                                            }}>
                                                <TableCell sx={{
                                                    whiteSpace: 'normal',
                                                    wordBreak: 'break-word'
                                                }} align="left">{student.name}</TableCell>
                                                <TableCell sx={{
                                                    whiteSpace: 'normal',
                                                    wordBreak: 'break-word'
                                                }} align="left">{getAreaNameById(student.areaId)}</TableCell>
                                                <TableCell sx={{
                                                    whiteSpace: 'normal',
                                                    wordBreak: 'break-word',
                                                }} align="left">{student.email}</TableCell>
                                                <TableCell sx={{
                                                    whiteSpace: 'normal',
                                                    wordBreak: 'break-word',
                                                }} align="left">{getTutorNameById(student.tutorId)}</TableCell>
                                                <TableCell sx={{
                                                    whiteSpace: 'normal',
                                                    wordBreak: 'break-word',
                                                }} align="left">{student.isActive === 1 ? "Sí" : "No"}</TableCell>
                                            </TableRow>
                                        )
                                    })}
                            </TableBody>
                        </Table>
                        <Grid container justifyContent="center">
                            <TablePagination
                                rowsPerPageOptions={[5, 10, 25]} // Options for rows per page
                                component="div"
                                count={students.length} // Total number of students
                                rowsPerPage={rowsPerPage}
                                page={page}
                                onPageChange={handleChangePage}
                                onRowsPerPageChange={handleChangeRowsPerPage}
                                labelRowsPerPage="Filas por página:" // Custom label for rows per page
                                labelDisplayedRows={({from, to, count}) =>
                                    `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
                                } // Custom label for displayed rows
                            />
                        </Grid>
                    </TableContainer>
                }
            </Grid>

        </Grid>
    );
};
