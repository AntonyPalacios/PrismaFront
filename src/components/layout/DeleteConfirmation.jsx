import {Grid} from "@mui/material";
import Typography from "@mui/material/Typography";
import {MyActionButtons} from "../ui/MyActionButtons.jsx";

export const DeleteConfirmation = ({name,onConfirmAction, onCancelAction}) => {
    return (
        <Grid container spacing={2}>
            <Typography variant="body1" component="div">¿Desea eliminar permanentemente: {name} ?</Typography>
            <MyActionButtons
                onConfirmAction={onConfirmAction}
                onCancelAction={onCancelAction}
            />
        </Grid>
    );
};
