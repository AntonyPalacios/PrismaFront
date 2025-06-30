import AddIcon from "@mui/icons-material/Add";
import {Fab} from "@mui/material";

export const MyFab = ({onHandleCLick}) => {
    return (
        <Fab
            sx={{
                position: 'fixed',
                bottom: 16,
                right: 16, display: {
                    xs: 'flex',  // visible en XS
                    sm: 'flex',  // visible en SM
                    md: 'none',  // oculto en MD en adelante
                }
            }}
            onClick={onHandleCLick}
            color="primary" aria-label="add">
            <AddIcon />
        </Fab>
    );
};
