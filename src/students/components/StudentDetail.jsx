import {useLocation} from "react-router";
import {Grid} from "@mui/material";

import {useState} from "react";
import {MyButton} from "../../components/ui";
import {useForm} from "../../hooks/useForm.js";
import {StudentForm} from "./StudentForm.jsx";
import {MyAlert} from "../../components/ui/MyAlert.jsx";

export const StudentDetail = () => {
    const location = useLocation();
    const {student} = location.state;

    const {dni, areaId, name, email, phone, tutorId, active, onInputChange} = useForm({
        dni: student.dni,
        areaId: student.area.id,
        name: student.name,
        email: student.email,
        phone: student.phone,
        tutorId: student.tutor.id,
        active: student.active ? 1 : 0,
    });

    const [disabled, setDisabled] = useState(true)
    const [open, setOpen] = useState(false);
    const onAlertClose = () => {
        setOpen(false);
    }
    const onClickEdit = () => {
        setDisabled(!disabled);
        setOpen(true);
    }

    return (
        <Grid container spacing={2} width='100%' >
            <StudentForm
                dni={dni}
                areaId={areaId}
                name={name}
                email={email}
                phone={phone}
                tutorId={tutorId}
                active={active}
                disabled={disabled}
                onInputChange={onInputChange}
                onClickEdit={onClickEdit}
                action="edit"

            />
            {/*<Grid container size={{xs: 12}} sx={{justifyContent: 'flex-end'}}>
                <MyButton size="small" color='error'>Borrar</MyButton>
                <MyButton size="small" onClick={onClickEdit}>{disabled ? "Editar" : "Guardar"}</MyButton>
            </Grid>*/}
            <MyAlert message="Alumno guardado correctamente" severity="success" open={open} handleClose={onAlertClose}/>
        </Grid>
    );
};
