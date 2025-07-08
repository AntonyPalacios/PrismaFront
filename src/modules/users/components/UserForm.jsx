import {Grid} from "@mui/material";
import {MyInput} from "../../../components/ui/index.js";
import {MySwitch} from "../../../components/ui/MySwitch.jsx";
import {MyActionButtons} from "../../../components/ui/MyActionButtons.jsx";
import {useModal} from "../../../hooks/useModal.js";
import {useActionType} from "../../../hooks/useActionType.js";
import {DeleteConfirmation} from "../../../components/layout/DeleteConfirmation.jsx";
import MyModal from "../../../components/ui/MyModal.jsx";
import {Controller, useForm} from "react-hook-form";
import {useCallback} from "react";
import {useUser} from "../../../hooks/useUser.js";

const initialForm = {
    id: null,
    name: '',
    email: '',
    isAdmin: false,
    isTutor: false,
    isActive: true
}
export const UserForm = ({user=initialForm, disabled=false, action="new", toggleForm, onCloseForm}) => {

    const {
        control,
        handleSubmit,
        watch,
        setValue,
        reset,
        formState: { errors, isValid, isDirty }
    } = useForm({
        defaultValues: user
    });

    const {open, toggleModal,title} = useModal({title : "Confirmación"});

    const {onHandleCreate, onHandleUpdate, onHandleDelete} = useUser({
        onCloseForm,
        toggleForm,
        onResetForm: () => reset(initialForm)
    });


    const {actionType,handleConfirmAction, handleCancelAction} = useActionType({onHandleCreate,
        onHandleUpdate, action,disabled,toggleForm,toggleModal,onCloseForm});

    const onSubmit = useCallback((data) => {
        // Llama a tu handleConfirmAction, pasándole los datos validados de RHF
        handleConfirmAction(data);
    }, [handleConfirmAction]);

    const onDeleteConfirmed = useCallback(() => {
        const currentDataForDelete = watch();
        onHandleDelete(currentDataForDelete);
    }, [onHandleDelete, watch]);

    return (
        <Grid container spacing={2}>

            <Grid size={{xs: 12}}>
                <Controller
                    name="name"
                    control={control}
                    render={({field,fieldState}) => (
                        <MyInput
                            {...field}
                            label="Nombre"
                            disabled={disabled}
                            error={!!fieldState.error}
                            helperText={fieldState.error?.message}
                        />
                    )}
                />
            </Grid>
            <Grid size={{xs: 12}}>
                <Controller
                    name="email"
                    control={control}
                    render={({field,fieldState}) => (
                        <MyInput
                            {...field}
                            label="Correo"
                            disabled={disabled}
                            error={!!fieldState.error}
                            helperText={fieldState.error?.message}
                        />
                    )}
                />
            </Grid>
            <Grid size={{xs: 4}} display="flex" justifyContent="center">
                <Controller
                    name="isAdmin"
                    control={control}
                    render={({field}) => (
                        <MySwitch
                            {...field}
                            label="Admin"
                            disabled={disabled}
                            checked={field.value}
                        />
                    )}
                />

            </Grid>
            <Grid size={{xs: 4}} display="flex" justifyContent="center">
                <Controller
                    name="isTutor"
                    control={control}
                    render={({field}) => (
                        <MySwitch
                            {...field}
                            label="Tutor"
                            disabled={disabled}
                            checked={field.value}
                        />
                    )}
                />
            </Grid>
            <Grid size={{xs: 4}} display="flex" justifyContent="center">
                <Controller
                    name="isActive"
                    control={control}
                    render={({field}) => (
                        <MySwitch
                            {...field}
                            label="Activo"
                            disabled={disabled}
                            checked={field.value}
                        />
                    )}
                />
            </Grid>

            <MyActionButtons onConfirmAction={handleSubmit(onSubmit)}
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

                content={<DeleteConfirmation
                    name={watch('name')}
                    onConfirmAction={onDeleteConfirmed}
                    onCancelAction={toggleModal}
                />}
            />
        </Grid>
    );
};
