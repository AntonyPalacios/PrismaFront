import {Grid} from "@mui/material";
import {MyInput, MySelect} from "../../../components/ui/index.js";
import {areas, studentStates, tutores} from "../../../assets/fakeData.jsx";
import {MyActionButtons} from "../../../components/ui/MyActionButtons.jsx";
import {useForm} from "../../../hooks/useForm.js";
import {useStudent} from "../../../hooks/useStudent.js";
import {useEffect, useState} from "react";
import {StudentDeleteConfirmation} from "./StudentDeleteConfirmation.jsx";
import MyModal from "../../../components/ui/MyModal.jsx";
import {useModal} from "../../../hooks/useModal.js";

const initialForm = {
    id: null,
    dni: '',
    areaId: 1,
    name: '',
    email: '',
    phone: '',
    tutorId: 1,
    active: true
}
export const StudentForm = ({student = initialForm, disabled = false, action = "new", toggleForm, onCloseForm}) => {

    const {open, toggleModal,title} = useModal({title : "Confirmación"});

    const {
        formState,
        onInputChange, onResetForm
    } = useForm(student);


    const {onHandleCreate, onHandleUpdate, onHandleDelete} = useStudent({
        studentForm: formState,
        onCloseForm,
        toggleForm,
        onResetForm
    });

    const [actionType, setActionType] = useState("create");

    // En cada render, usamos el estado actualizado
    const handleConfirmAction = () => {
        if (actionType === "create") {
            onHandleCreate(formState);
        } else if (actionType === "update") {
            onHandleUpdate(formState);
        } else if (actionType === 'edit-disabled') {
            toggleForm();
        }
    };

    const handleCancelAction = () => {
        if (actionType === "edit-disabled") {
            toggleModal();
        } else {
            onCloseForm();
        }
    };

    useEffect(() => {
        if (action === "edit") {
            if (disabled) {
                setActionType("edit-disabled");
            } else {
                setActionType("update");
            }
        } else {
            setActionType("create");
        }
    }, [action, disabled]);

    return (
        <Grid container spacing={2} width='100%'>
            <Grid size={{xs: 6}}>
                <MyInput
                    disabled={disabled}
                    label="DNI"
                    value={formState.dni}
                    name="dni"
                    handleChange={onInputChange}/>
            </Grid>
            <Grid size={{xs: 6}}>
                <MySelect
                    name="areaId"
                    options={areas}
                    label="Área"
                    disabled={disabled}
                    value={formState.areaId}
                    handleChange={onInputChange}/>
            </Grid>
            <Grid size={{xs: 12}}>
                <MyInput
                    name="name"
                    disabled={disabled}
                    label="Nombre"
                    value={formState.name}
                    handleChange={onInputChange}/>
            </Grid>
            <Grid size={{xs: 6}}>
                <MyInput
                    name="email"
                    disabled={disabled}
                    label="Correo"
                    value={formState.email}
                    handleChange={onInputChange}/>
            </Grid>
            <Grid size={{xs: 6}}>
                <MyInput
                    name="phone"
                    disabled={disabled}
                    label="Teléfono"
                    value={formState.phone}
                    handleChange={onInputChange}/>
            </Grid>
            <Grid size={{xs: 6}}>
                <MySelect
                    name="tutorId"
                    options={tutores}
                    label="Tutor"
                    disabled={disabled}
                    value={formState.tutorId}
                    handleChange={onInputChange}/>
            </Grid>
            <Grid size={{xs: 6}}>
                <MySelect
                    name="active"
                    options={studentStates}
                    label="Estado"
                    disabled={disabled}
                    value={formState.active}
                    handleChange={onInputChange}/>
            </Grid>
            <MyActionButtons onConfirmAction={handleConfirmAction}
                             onCancelAction={handleCancelAction}
                             confirmText={
                                 actionType === "edit-disabled" ? "Editar" :
                                     actionType === "update" ? "Guardar" : "Aceptar"
                             }
                             cancelText={
                                 actionType === "edit-disabled" ? "Borrar" : "Cancelar"
                             }/>

            <MyModal
                open={open}
                toggleModal={toggleModal}
                title={title}

                content={<StudentDeleteConfirmation
                    name={formState.name}
                    onConfirmAction={()=>onHandleDelete(formState)}
                    onCancelAction={toggleModal}
                />}
            />
        </Grid>
    );
};
