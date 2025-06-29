import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import {MyTitle} from "./MyTitle.jsx";
import {Box, Grid} from "@mui/material";
import {MyButton} from "./MyButton.jsx";

export default function MyModal({
                                    open, handleClose, title, content,
                                    confirmText, cancelText, onHandleConfirm, onHandleCancel
                                }) {

    return (
        <Dialog
            open={open}
            onClose={handleClose}
        >
            <DialogTitle>
                <MyTitle>{title}</MyTitle>
            </DialogTitle>
            <DialogContent>
                <Box sx={{marginTop: 1}}>
                    {content}
                </Box>
            </DialogContent>
            <DialogActions>
                <Grid container spacing={2} size={{xs: 12}} sx={{justifyContent: 'flex-end'}}>
                    <MyButton size="small" color="error"
                              onClick={onHandleCancel ? onHandleCancel : handleClose}>{cancelText}</MyButton>
                    <MyButton size="small" onClick={onHandleConfirm}>{confirmText}</MyButton>
                </Grid>
            </DialogActions>
        </Dialog>
    );
}