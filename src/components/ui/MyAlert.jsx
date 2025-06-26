import {Alert, Snackbar} from "@mui/material";

export const MyAlert = ({message,severity,open,handleClose}) => {

    return (
        <Snackbar
            open={open}
            autoHideDuration={3000} // 3 segundos
            onClose={handleClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
            <Alert severity={severity} onClose={handleClose}>
                {message}
            </Alert>
        </Snackbar>
    );
};
