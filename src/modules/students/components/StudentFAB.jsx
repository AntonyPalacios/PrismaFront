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
import {useModal} from "../../../hooks/useModal.js";
import {StudentImport} from "./StudentImport.jsx";


export default function StudentFAB() {
    const {isLargeScreen} = useContext(AppContext);
    const {open:openModalCreate, toggleModal: toggleModalCreate,title: titleCreate} = useModal({title : "Nuevo Alumno"});
    const {open:openModalImport, toggleModal: toggleModalImport,title: titleImport} = useModal({title : "Importar Alumnos"});

    const [openDial, setOpenDial] = useState(false);

    const toggleDial = () =>{
        setOpenDial(!openDial);
    }

    const modalCreate = (
        <MyModal
            open={openModalCreate}
            toggleModal={toggleModalCreate}
            title={titleCreate}
            content={
                <StudentForm onCloseForm={toggleModalCreate}/>
            }
        />
    );

    const modalImport = (
        <MyModal
            open={openModalImport}
            toggleModal={toggleModalImport}
            title={titleImport}
            content={<StudentImport onCloseForm={toggleModalImport}/>}

        />
    )



    if (isLargeScreen) {
        return (
            <>
                {openModalCreate && modalCreate}
                {openModalImport && modalImport}
                <Grid container width="100%" justifyContent="flex-end">
                    <Grid size={2} sx={{
                        justifyContent: "flex-end",
                        display: "flex",
                    }}>
                        <MyButton onClick={toggleModalImport} sx={{marginRight: '20px'}}>Importar</MyButton>
                        <MyButton onClick={toggleModalCreate}>Nuevo</MyButton>
                    </Grid>
                </Grid>
            </>
        )
    }
    return (
        <Box >
            {openModalCreate && modalCreate}
            {openModalImport && modalImport}
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
                    onClick={toggleModalCreate}
                    sx={{color: 'primary.main'}}
                />
                <SpeedDialAction
                    icon={<Upload/>}
                    onClick={toggleModalImport}
                    sx={{color: 'primary.main'}}
                />

            </SpeedDial>
        </Box>
    );
}