import {Grid} from "@mui/material";
import Typography from "@mui/material/Typography";
import {MyActionButtons} from "../ui/MyActionButtons.jsx";

export const DeleteConfirmation = ({name,onConfirmAction, onCancelAction}) => {
    return (
        <Grid container spacing={2}>
            <Typography variant="body1" component="div" display="flex">
                ¿Desea eliminar permanentemente: <Typography variant="body1" sx={{fontWeight:"bold"}}>{name}</Typography> ?
            </Typography>
            <Typography variant="body2" component="span" sx={{color:"error.main", fontWeight:"bold"}}>Esto eliminará todo su contenido asociado</Typography>
            <MyActionButtons
                onConfirmAction={onConfirmAction}
                onCancelAction={onCancelAction}
            />
        </Grid>
    );
};
