import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import {MyTitle} from "./MyTitle.jsx";
import {Box} from "@mui/material";

export default function MyModal({open, toggleModal, title, content}) {

    return (
        <Dialog
            open={open}
            onClose={toggleModal}
        >
            <DialogTitle>
                <MyTitle>{title}</MyTitle>
            </DialogTitle>
            <DialogContent>
                <Box sx={{marginTop: 1}}>
                    {content}
                </Box>
            </DialogContent>
        </Dialog>
    );
}