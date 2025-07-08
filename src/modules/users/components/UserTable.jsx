import {Grid, Paper} from "@mui/material";
import TableContainer from "@mui/material/TableContainer";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableBody from "@mui/material/TableBody";
import {useNavigate} from "react-router";
import {useContext} from "react";
import {UserContext} from "../../../context/UserContext.jsx";

export const UserTable = () => {

    const {state:{users}} = useContext(UserContext);

    const navigate = useNavigate();

    const onClickUser = (id) => {
        navigate(`/users/${id}`);
    }

    return (
        <Grid container spacing={2}>
            <Grid size={12} sx={{ flexGrow: 1 }}>
                <TableContainer component={Paper} sx={{width:'100%', overflowX: 'auto'}} >
                    <Table sx={{width:'100%', tableLayout: 'fixed'}}>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{width:'110px'}} align="left">Nombre</TableCell>
                                <TableCell sx={{width:'150px'}} align="left">Correo</TableCell>
                                <TableCell sx={{width:'150px'}} align="left">Administrador</TableCell>
                                <TableCell sx={{width:'150px'}} align="left">Tutor</TableCell>
                                <TableCell sx={{width:'150px'}} align="left">Activo</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {users.map((user) => {
                                return (
                                    <TableRow hover key={user.id} onClick={() => {onClickUser(user.id)}}>
                                        <TableCell sx={{whiteSpace: 'normal',
                                            wordBreak: 'break-word'}} align="left">{user.name}</TableCell>
                                        <TableCell sx={{whiteSpace: 'normal',
                                            wordBreak: 'break-word'}} align="left">{user.email}</TableCell>
                                        <TableCell sx={{whiteSpace: 'normal',
                                            wordBreak: 'break-word',}} align="left">{user.isAdmin?"Si":"No"}</TableCell>
                                        <TableCell sx={{whiteSpace: 'normal',
                                            wordBreak: 'break-word',}} align="left">{user.isTutor?"Si":"No"}</TableCell>
                                        <TableCell sx={{whiteSpace: 'normal',
                                            wordBreak: 'break-word',}} align="left">{user.isActive?"Sí":"No"}</TableCell>
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
