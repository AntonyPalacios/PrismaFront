import {useLocation} from "react-router";
import {Grid} from "@mui/material";

import {useContext, useState} from "react";
import {useForm} from "../../../hooks/useForm.js";
import {StudentForm} from "./StudentForm.jsx";
import {MyAlert} from "../../../components/ui/MyAlert.jsx";
import {StudentContext} from "../../../context/StudentContext.jsx";
import {useStudent} from "../../../hooks/useStudent.js";
import MyModal from "../../../components/ui/MyModal.jsx";
import {useModal} from "../../../hooks/useModal.js";
import {StudentGraphics} from "./StudentGraphics.jsx";

export const StudentDetail = () => {
    const location = useLocation();
    const {student} = location.state;
    const {state: {studentAlert}, onToggleAlert} = useContext(StudentContext);


    const {id, dni, areaId, name, email, phone, tutorId, active, onInputChange} = useForm({
        id: student.id,
        dni: student.dni,
        areaId: student.area.id,
        name: student.name,
        email: student.email,
        phone: student.phone,
        tutorId: student.tutor.id,
        active: student.active ? 1 : 0,
    });

    const [disabled, setDisabled] = useState(true);
    const onEditForm = () => {
        setDisabled(!disabled);
    }

    const {onHandleUpdate, onHandleDelete} = useStudent({
        id, dni, areaId, name, email, phone, tutorId, disabled, active, onEditForm
    })

    const {open,toggleModal, title, confirmText,cancelText} = useModal({title:"Confirmación"})

    return (
        <Grid container spacing={2} width='100%'>
            <StudentForm
                id={id}
                dni={dni}
                areaId={areaId}
                name={name}
                email={email}
                phone={phone}
                tutorId={tutorId}
                active={active}
                disabled={disabled}
                onInputChange={onInputChange}
                onEditForm={onEditForm}
                action="edit"
                onHandleConfirm={onHandleUpdate}
                onHandleCancel={toggleModal}

            />
            <StudentGraphics/>
            <MyAlert message={studentAlert.message} severity={studentAlert.severity} open={studentAlert.open}
                     onHandleClose={onToggleAlert}/>
            <MyModal
                open={open}
                toggleModal={toggleModal}
                title={title}
                confirmText={confirmText}
                cancelText={cancelText}

                onHandleConfirm={onHandleDelete}
                onHandleCancel={toggleModal}

                content={<p>¿Desea eliminar a {name} permanentemente?</p>}
            />
        </Grid>
    );
};
