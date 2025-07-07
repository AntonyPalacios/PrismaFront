import {FormControlLabel, Grid, Switch} from "@mui/material";
import {MyButton, MyInput} from "../../../components/ui/index.js";
import {useForm} from "../../../hooks/useForm.js";
import {MySwitch} from "../../../components/ui/MySwitch.jsx";
import {MyActionButtons} from "../../../components/ui/MyActionButtons.jsx";
import {useModal} from "../../../hooks/useModal.js";
import {useActionType} from "../../../hooks/useActionType.js";
import {StudentDeleteConfirmation} from "../../students/components/StudentDeleteConfirmation.jsx";
import MyModal from "../../../components/ui/MyModal.jsx";

const initialForm = {
    id: null,
    name: '',
    email: '',
    isAdmin: false,
    isTutor: false,
    isActive: true
}
export const UserForm = ({user=initialForm, disabled=false, action="new", toggleForm, onCloseForm}) => {

    const {formState:userData,onInputChange,onResetForm} = useForm(user);

    const {open, toggleModal,title} = useModal({title : "Confirmación"});

    const onHandleCreate =() =>{
        console.log("onHandleCreate")
    }

    const onHandleUpdate =() =>{
        console.log("onHandleUpdate")
    }

    const {actionType,handleConfirmAction, handleCancelAction} = useActionType({formState:userData,onHandleCreate,
        onHandleUpdate, action,disabled,toggleForm,toggleModal,onCloseForm});

    return (
        <Grid container spacing={2}>

            <Grid size={{xs: 12}}>
                <MyInput
                    disabled={disabled}
                    label="Nombre"
                    value={userData.name}
                    name="name"
                    handleChange={onInputChange}
                />
            </Grid>
            <Grid size={{xs: 12}}>
                <MyInput
                    disabled={disabled}
                    label="Correo"
                    value={userData.email}
                    name="email"
                    handleChange={onInputChange}
                />
            </Grid>
            <Grid size={{xs: 4}} display="flex" justifyContent="center">
                    <MySwitch
                        label="Admin"
                        disabled={disabled}
                        checked={userData.isAdmin}
                        name="isAdmin"
                        handleChange={onInputChange}
                    />
            </Grid>
            <Grid size={{xs: 4}} display="flex" justifyContent="center">
                <MySwitch
                    label="Tutor"
                    disabled={disabled}
                    checked={userData.isTutor}
                    name="isTutor"
                    handleChange={onInputChange}
                />
            </Grid>
            <Grid size={{xs: 4}} display="flex" justifyContent="center">
                <MySwitch
                    label="Activo"
                    disabled={disabled}
                    checked={userData.isActive}
                    name="isActive"
                    handleChange={onInputChange}
                />
            </Grid>

            <MyActionButtons onConfirmAction={handleConfirmAction}
                             onCancelAction={handleCancelAction}
                             confirmText={
                                 actionType === "edit-disabled" ? "Editar" :
                                     actionType === "update" ? "Guardar" : "Aceptar"
                             }
                             cancelText={
                                 actionType === "create" ? "Cancelar" : "Borrar"
                             }/>

            <MyModal
                open={open}
                toggleModal={toggleModal}
                title={title}

                content={<StudentDeleteConfirmation
                    name={userData.name}
                    onConfirmAction={()=>{}}
                    onCancelAction={toggleModal}
                />}
            />
        </Grid>
    );
};
