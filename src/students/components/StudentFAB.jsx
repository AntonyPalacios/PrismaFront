import Box from '@mui/material/Box';
import SpeedDial from '@mui/material/SpeedDial';
import SpeedDialIcon from '@mui/material/SpeedDialIcon';
import SpeedDialAction from '@mui/material/SpeedDialAction';
import FileCopyIcon from '@mui/icons-material/FileCopyOutlined';
import SaveIcon from '@mui/icons-material/Save';
import {Upload, Edit} from '@mui/icons-material'
import PrintIcon from '@mui/icons-material/Print';
import ShareIcon from '@mui/icons-material/Share';
import {useContext, useState} from "react";
import {AppContext} from "../../context/AppContext.jsx";
import {Grid} from "@mui/material";
import {MyButton} from "../../components/ui/MyButton.jsx";
import MyModal from "../../components/ui/MyModal.jsx";
import {StudentForm} from "./StudentForm.jsx";
import {useForm} from "../../hooks/useForm.js";

const initialForm = {
    dni:'',
    areaId:1,
    name:'',
    email:'',
    phone:'',
    tutorId:1,
    active:1,
}

export default function StudentFAB() {
    const {isLargeScreen} = useContext(AppContext);

    const [openModal, setOpenModal] = useState(false)

    const showModal = () => {
        setOpenModal(!openModal);
    }

    const { dni,areaId,name,email,phone,tutorId, active, onInputChange } = useForm(initialForm);
    const modal = (
        <MyModal
            open={openModal}
            handleClose={showModal}
            title="Nuevo Alumno"
            content={<StudentForm
                dni={dni}
                areaId={areaId}
                name={name}
                email={email}
                phone={phone}
                tutorId={tutorId}
                active={active}
                onInputChange={onInputChange}

            />}
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
                        <MyButton onClick={showModal}>Nuevo</MyButton>
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
                    onClick={showModal}
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