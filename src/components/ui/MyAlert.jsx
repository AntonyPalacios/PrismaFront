import {Alert, Snackbar} from "@mui/material";

export const MyAlert = ({message,severity, open, onHandleClose}) => {

    return (
        <Snackbar
            open={open}
            autoHideDuration={3000} // 3 segundos
            onClose={onHandleClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
            <Alert severity={severity} onClose={onHandleClose}>
                {message}
            </Alert>
        </Snackbar>
    );
};
