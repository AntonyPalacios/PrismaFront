import {Grid, Paper} from "@mui/material";
import TableContainer from "@mui/material/TableContainer";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableBody from "@mui/material/TableBody";
import {cycles} from "../../../assets/fakeData.jsx";
import {useNavigate} from "react-router";

export const CycleTable = () => {

    const navigate = useNavigate();

    const onClickCycle = (id) => {
        navigate(`/cycles/${id}`);
    }

    return (
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
                            {cycles.map((cycle) => {
                                return (
                                    <TableRow hover key={cycle.id} onClick={() => {onClickCycle(cycle.id)}}>
                                        <TableCell sx={{whiteSpace: 'normal',
                                            wordBreak: 'break-word'}} align="left">{cycle.name}</TableCell>
                                        <TableCell sx={{whiteSpace: 'normal',
                                            wordBreak: 'break-word'}} align="left">{cycle.initDate}</TableCell>
                                        <TableCell sx={{whiteSpace: 'normal',
                                            wordBreak: 'break-word',}} align="left">{cycle.endDate}</TableCell>
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
