import {Grid} from "@mui/material";
import {MyTitle} from '../../components/ui/MyTitle.jsx'
import {MyButton} from "../../components/ui/MyButton.jsx";
import {useContext} from "react";
import {AppContext} from "../../context/AppContext.jsx";

export const UsersPage = () => {
    const {isLargeScreen} = useContext(AppContext);
    const variant = () =>{
        return isLargeScreen? "h4":"h6"
    }
    return (
        <Grid container >
            <Grid size={12}>
                <MyTitle
                    variant={variant}
                >Usuarios</MyTitle>
            </Grid>
            <Grid size={12} sx={{ marginTop:5, marginX:10}} >
            </Grid>
            <Grid size={12} sx={{ marginTop:5,marginX:10,display:'flex', direction:'row', justifyContent:'flex-end'}} >
                <MyButton>Nuevo</MyButton>
            </Grid>
        </Grid>
    );
};
