import {MyButton} from "./MyButton.jsx";
import {Grid} from "@mui/material";

export const MyActionButtons = ({
                                    confirmText = "Aceptar",
                                    cancelText = "Cancelar",
                                    onConfirmAction = () => {
                                        console.log("aceptar")
                                    },
                                    onCancelAction = () => {
                                        console.log("cancelar")
                                    }
                                }) => {
    return (
        <Grid container size={{xs: 12}} sx={{justifyContent: 'flex-end'}} spacing={2}>
            <MyButton size="small" color='error' onClick={onCancelAction}>{cancelText}</MyButton>
            <MyButton size="small" onClick={onConfirmAction}>{confirmText}</MyButton>
        </Grid>
    );
};
