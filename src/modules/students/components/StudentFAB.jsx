import Box from '@mui/material/Box';
import SpeedDial from '@mui/material/SpeedDial';
import SpeedDialIcon from '@mui/material/SpeedDialIcon';
import SpeedDialAction from '@mui/material/SpeedDialAction';
import {Edit, Upload} from '@mui/icons-material'
import {useContext, useState} from "react";
import {AppContext} from "../../../context/AppContext.jsx";
import {Grid} from "@mui/material";
import {MyButton} from "../../../components/ui/MyButton.jsx";
import MyModal from "../../../components/ui/MyModal.jsx";
import {StudentForm} from "./StudentForm.jsx";
import {useForm} from "../../../hooks/useForm.js";
import {useStudent} from "../../../hooks/useStudent.js";
import {useModal} from "../../../hooks/useModal.js";


export default function StudentFAB() {
    const {isLargeScreen} = useContext(AppContext);
    const {open, toggleModal,title} = useModal({title : "Nuevo Alumno"});

    const [openDial, setOpenDial] = useState(false);

    const toggleDial = () =>{
        setOpenDial(!openDial);
    }

    const modal = (
        <MyModal
            open={open}
            toggleModal={toggleModal}
            title={title}
            content={
                <StudentForm onCloseForm={toggleModal}/>
            }
        />
    );



    if (isLargeScreen) {
        return (
            <>
                {modal}
                <Grid container width="100%" justifyContent="flex-end">
                    <Grid size={2} sx={{
                        justifyContent: "flex-end",
                        display: "flex",
                    }}>
                        <MyButton sx={{marginRight: '20px'}}>Importar</MyButton>
                        <MyButton onClick={toggleModal}>Nuevo</MyButton>
                    </Grid>
                </Grid>
            </>
        )
    }
    return (
        <Box >
            {modal}
            <SpeedDial
                ariaLabel="SpeedDial basic example"
                open={openDial}
                onClick={toggleDial}
                sx={{
                    position: 'fixed',
                    bottom: 16,
                    right: 16, display: {
                        xs: 'flex',  // visible en XS
                        sm: 'flex',  // visible en SM
                        md: 'none',  // oculto en MD en adelante
                    }
                }}
                icon={<SpeedDialIcon/>}
            >
                <SpeedDialAction
                    icon={<Edit/>}
                    onClick={toggleModal}
                    sx={{color: 'primary.main'}}
                />
                <SpeedDialAction
                    icon={<Upload/>}
                    sx={{color: 'primary.main'}}
                />

            </SpeedDial>
        </Box>
    );
}