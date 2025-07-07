import {MyButton} from "./MyButton.jsx";
import {Grid} from "@mui/material";
import {memo} from "react";

export const MyActionButtons = memo(({
                                    confirmText = "Aceptar",
                                    cancelText = "Cancelar",
                                    onConfirmAction = () => {
                                        console.log("aceptar")
                                    },
                                    onCancelAction = () => {
                                        console.log("cancelar")
                                    }
                                }) => {
    console.log("render actionButtons")
    return (
        <Grid container size={{xs: 12}} sx={{justifyContent: 'flex-end'}} spacing={2}>
            <MyButton size="small" color='error' onClick={onCancelAction}>{cancelText}</MyButton>
            <MyButton size="small" onClick={onConfirmAction}>{confirmText}</MyButton>
        </Grid>
    );
});
