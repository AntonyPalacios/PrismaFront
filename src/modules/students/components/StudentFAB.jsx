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

const initialForm = {
    id:null,
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

    const [openDial, setOpenDial] = useState(false);

    const toggleDial = () =>{
        setOpenDial(!openDial);
    }

    const {open,toggleModal,title,confirmText,cancelText} = useModal({
        title:"Nuevo Alumno"
    });

    const {id, dni,areaId,name,email,phone,tutorId, active, onInputChange, onResetForm } = useForm(initialForm);

    const {onHandleCreate} = useStudent({
        id,dni,areaId,name,email,phone,tutorId, active, onResetForm, handleClose:toggleModal
    })

    const modal = (
        <MyModal
            open={open}
            handleClose={toggleModal}
            title={title}
            confirmText={confirmText}
            cancelText={cancelText}
            onHandleConfirm={onHandleCreate}
            onHandleCancel={toggleModal}

            content={<StudentForm
                dni={dni}
                areaId={areaId}
                name={name}
                email={email}
                phone={phone}
                tutorId={tutorId}
                active={active}
                onInputChange={onInputChange}
                action="new"
                onResetForm={onResetForm}
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