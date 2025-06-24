import {Grid, Paper} from "@mui/material";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import {fakeStudents} from "../../assets/fakeData.jsx";

export const StudentTable = () => {
    return (
        <Grid container spacing={2}>
            <Grid size={12} sx={{ flexGrow: 1 }}>
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
                            {fakeStudents.map((student) => {
                                return (
                                    <TableRow hover key={student.id}>
                                        <TableCell sx={{whiteSpace: 'normal',
                                            wordBreak: 'break-word'}} align="left">{student.name}</TableCell>
                                        <TableCell sx={{whiteSpace: 'normal',
                                            wordBreak: 'break-word'}} align="left">{student.area}</TableCell>
                                        <TableCell sx={{whiteSpace: 'normal',
                                            wordBreak: 'break-word',}} align="left">{student.email}</TableCell>
                                        <TableCell sx={{whiteSpace: 'normal',
                                            wordBreak: 'break-word',}} align="left">{student.tutor}</TableCell>
                                        <TableCell sx={{whiteSpace: 'normal',
                                            wordBreak: 'break-word',}} align="left">{student.active?"Sí":"No"}</TableCell>
                                    </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Grid>
        </Grid>
    );
};
