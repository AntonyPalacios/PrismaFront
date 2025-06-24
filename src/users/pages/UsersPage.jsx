import {Grid} from "@mui/material";
import {Title} from '../../components/ui/Title.jsx'
import {MyTable} from "../../components/ui/MyTable.jsx";
import {MyButton} from "../../components/ui/MyButton.jsx";

export const UsersPage = () => {
    return (
        <Grid container >
            <Grid size={12}>
                <Title
                    variant="h4"
                >Usuarios</Title>
            </Grid>
            <Grid size={12} sx={{ marginTop:5, marginX:10}} >
                    <MyTable></MyTable>
            </Grid>
            <Grid size={12} sx={{ marginTop:5,marginX:10,display:'flex', direction:'row', justifyContent:'flex-end'}} >
                <MyButton>Nuevo</MyButton>
            </Grid>
        </Grid>
    );
};
