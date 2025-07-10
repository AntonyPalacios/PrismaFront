import {Grid} from "@mui/material";
import {MyInput, MySelect} from "../../../components/ui/index.js";
import {areas, studentStates, tutores} from "../../../assets/fakeData.jsx";
import {MyActionButtons} from "../../../components/ui/MyActionButtons.jsx";
import {useStudent} from "../../../hooks/useStudent.js";
import {DeleteConfirmation} from "../../../components/layout/DeleteConfirmation.jsx";
import MyModal from "../../../components/ui/MyModal.jsx";
import {useModal} from "../../../hooks/useModal.js";
import {useActionType} from "../../../hooks/useActionType.js";
import {useCallback} from "react";
import {Controller, useForm} from "react-hook-form";

const defaultFormValues = {
    id: null,
    dni: '',
    areaId: undefined,
    name: '',
    email: '',
    phone: '',
    tutorId: undefined,
    active: true
}
export const StudentForm = ({student = defaultFormValues, disabled = false, action = "new", toggleForm, onCloseForm}) => {


    const {
        control, // Necesario para Controller
        handleSubmit, // Para manejar el envío
        watch, // Para observar valores si es necesario (ej. lógica condicional)
        setValue, // Para establecer valores programáticamente
        reset, // Para resetear el formulario
        formState: { errors, isValid, isDirty } // Acceso al estado de validación y cambios
    } = useForm({
        defaultValues: student // Usa los datos del estudiante como valores por defecto
    });

    // Puedes usar watch si necesitas el estado actual del formulario para lógica en tiempo real
    // const currentFormData = watch();
    // console.log("Current RHF form data:", currentFormData);

    const {open, toggleModal,title} = useModal({title : "Confirmación"});


    const {onHandleCreate, onHandleUpdate, onHandleDelete} = useStudent({
        onCloseForm,
        toggleForm,
        onResetForm: () => reset(defaultFormValues)
    });

    const {actionType,handleConfirmAction, handleCancelAction} = useActionType({onHandleCreate,
        onHandleUpdate, action,disabled,toggleForm,toggleModal,onCloseForm});

    // 2. Define la función de envío que React Hook Form llamará
    const onSubmit = useCallback((data) => {
        console.log("Form submitted with data (from RHF):", data);
        // Llama a tu handleConfirmAction, pasándole los datos validados de RHF
        handleConfirmAction(data); // handleConfirmAction ahora espera los datos
    }, [handleConfirmAction]);

    // 3. Define la función para manejar la eliminación (si se necesita el formState)
    // Cuando el botón de borrar se presiona en el modal, necesitamos el estado actual
    // Podemos obtenerlo usando watch() o directamente pasando los valores del formulario
    const onDeleteConfirmed = useCallback(() => {
        const currentDataForDelete = watch(); // Obtiene los valores actuales para la eliminación
        onHandleDelete(currentDataForDelete); // Pasa los datos actuales para la eliminación
    }, [onHandleDelete, watch]);

    return (
        <Grid container spacing={2} width='100%'>
            <Grid size={{xs: 6}}>
                <Controller
                    name="dni"
                    control={control}
                    rules={{ required: "El DNI es obligatorio", maxLength: { value: 8, message: "Máximo 8 caracteres" } }}
                    render={({ field, fieldState }) => (
                        <MyInput
                            {...field} // Esto mapea name, value, onChange, onBlur a tu MyInput
                            disabled={disabled}
                            required
                            label="DNI"
                            error={!!fieldState.error} // Indica error si existe
                            helperText={fieldState.error?.message} // Muestra mensaje de error
                        />
                    )}
                />
            </Grid>
            <Grid size={{xs: 6}}>
                <Controller
                    name="areaId"
                    control={control}
                    rules={{ required: "El Área es obligatoria" }}
                    render={({ field, fieldState }) => (
                        <MySelect
                            {...field}
                            options={areas}
                            label="Área"
                            disabled={disabled}
                            error={!!fieldState.error}
                            helperText={fieldState.error?.message}
                        />
                    )}
                />
            </Grid>
            <Grid size={{xs: 12}}>
                <Controller
                    name="name"
                    control={control}
                    rules={{ required: "El Nombre es obligatorio", minLength: { value: 3, message: "Mínimo 3 caracteres" } }}
                    render={({ field, fieldState }) => (
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
            <Grid size={{xs: 6}}>
                <Controller
                    name="email"
                    control={control}
                    rules={{
                        required: "El Correo es obligatorio",
                        pattern: {
                            value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                            message: "Formato de correo inválido"
                        }
                    }}
                    render={({ field, fieldState }) => (
                        <MyInput
                            {...field}
                            disabled={disabled}
                            label="Correo"
                            error={!!fieldState.error}
                            helperText={fieldState.error?.message}
                        />
                    )}
                />
            </Grid>
            <Grid size={{xs: 6}}>
                <Controller
                    name="phone"
                    control={control}
                    rules={{ required: "El Teléfono es obligatorio" }}
                    render={({ field, fieldState }) => (
                        <MyInput
                            {...field}
                            disabled={disabled}
                            label="Teléfono"
                            error={!!fieldState.error}
                            helperText={fieldState.error?.message}
                        />
                    )}
                />
            </Grid>
            <Grid size={{xs: 6}}>
                <Controller
                    name="tutorId"
                    control={control}
                    rules={{ required: "El Tutor es obligatorio" }}
                    render={({ field, fieldState }) => (
                        <MySelect
                            {...field}
                            options={tutores}
                            label="Tutor"
                            disabled={disabled}
                            error={!!fieldState.error}
                            helperText={fieldState.error?.message}
                        />
                    )}
                />
            </Grid>
            <Grid size={{xs: 6}}>
                <Controller
                    name="active"
                    control={control}
                    rules={{ required: "El Estado es obligatorio" }}
                    render={({ field, fieldState }) => (
                        <MySelect
                            {...field}
                            options={studentStates} // Asegúrate de que studentStates tenga {id: valor, name: etiqueta}
                            label="Estado"
                            disabled={disabled}
                            error={!!fieldState.error}
                            helperText={fieldState.error?.message}
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
