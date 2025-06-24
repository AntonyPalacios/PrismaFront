import Box from '@mui/material/Box';
import SpeedDial from '@mui/material/SpeedDial';
import SpeedDialIcon from '@mui/material/SpeedDialIcon';
import SpeedDialAction from '@mui/material/SpeedDialAction';
import FileCopyIcon from '@mui/icons-material/FileCopyOutlined';
import SaveIcon from '@mui/icons-material/Save';
import {Upload,Edit} from '@mui/icons-material'
import PrintIcon from '@mui/icons-material/Print';
import ShareIcon from '@mui/icons-material/Share';
import {useContext} from "react";
import {AppContext} from "../../context/AppContext.jsx";
import {Grid} from "@mui/material";
import {MyButton} from "../../components/ui/MyButton.jsx";

const actions = [
    { icon: <Edit />, name: 'Crear' },
    { icon: <Upload />, name: 'Importar' },
];

export default function StudentFAB() {
    const {isLargeScreen} = useContext(AppContext);

    if (isLargeScreen) {
        return (
            <Grid container  width="100%" justifyContent="flex-end" >
                <Grid size={2} sx={{
                    justifyContent:"flex-end",
                    display:"flex",
                }}>
                    <MyButton>Importar</MyButton>
                </Grid>
                <Grid size={2} sx={{
                    justifyContent:"flex-end",
                    display:"flex",
                }}>
                    <MyButton>Nuevo</MyButton>
                </Grid>
            </Grid>
        )
    }
    return (
        <Box sx={{   }}>
            <SpeedDial
                ariaLabel="SpeedDial basic example"
                sx={{
                    position: 'fixed',
                    bottom: 16,
                    right: 16,display: {
                        xs: 'flex',  // visible en XS
                        sm: 'flex',  // visible en SM
                        md: 'none',  // oculto en MD en adelante
                    }}}
                icon={<SpeedDialIcon />}
            >
                {actions.map((action) => (
                    <SpeedDialAction
                        key={action.name}
                        icon={action.icon}
                        sx={{ color: 'primary.main' }}
                    />
                ))}
            </SpeedDial>
        </Box>
    );
}