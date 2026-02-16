import {Grid} from "@mui/material";
import Typography from "@mui/material/Typography";
import {MyActionButtons} from "../ui/MyActionButtons.jsx";

export const ImportConfirmation = ({name,area,onConfirmAction, onCancelAction}) => {
    return (
        <Grid container spacing={2}>
            <Typography variant="body1" component="div" >
                ¿Desea importar para el área <Typography variant="p" sx={{fontWeight:"bold",color:"red"}}>{area}</Typography> el archivo <Typography variant="p" sx={{fontWeight:"bold"}}>{name}</Typography> ?
            </Typography>
            <MyActionButtons
                onConfirmAction={onConfirmAction}
                onCancelAction={onCancelAction}
            />
        </Grid>
    );
};
