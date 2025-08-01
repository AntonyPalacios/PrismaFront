import {Grid} from "@mui/material";
import {MyInput, MySelect} from "../../../components/ui/index.js";
import {studentStates} from "../../../assets/fakeData.jsx";
import {MyActionButtons} from "../../../components/ui/MyActionButtons.jsx";
import {useStudent} from "../../../hooks/useStudent.js";
import {DeleteConfirmation} from "../../../components/layout/DeleteConfirmation.jsx";
import MyModal from "../../../components/ui/MyModal.jsx";
import {useModal} from "../../../hooks/useModal.js";
import {useActionType} from "../../../hooks/useActionType.js";
import {useCallback} from "react";
import {Controller, useForm} from "react-hook-form";
import {useSelector} from "react-redux";
import {useGetAreasQuery} from "../../../store/slices/api/apiSlice.js";
import MenuItem from "@mui/material/MenuItem";

const defaultFormValues = {
    id: null,
    dni: '',
    areaId: 0,
    name: '',
    email: '',
    phone: '',
    tutorId: 0,
    stageId: 0,
    isActive: 1
}
export const StudentForm = ({
                                student = defaultFormValues,
                                disabled = false,
                                action = "new",
                                toggleForm,
                                onCloseForm
                            }) => {


    const {
        control, // Necesario para Controller
        handleSubmit, // Para manejar el envío
        watch, // Para observar valores si es necesario (ej. lógica condicional)
        setValue, // Para establecer valores programáticamente
        reset, // Para resetear el formulario
        formState: {errors, isValid, isDirty} // Acceso al estado de validación y cambios
    } = useForm({
        defaultValues: student // Usa los datos del estudiante como valores por defecto
    });

    const {open, toggleModal, title} = useModal({title: "Confirmación"});


    const {onSubmit, onHandleDelete} = useStudent({
        action,
        disabled,
        onCloseForm,
        toggleForm,
        onResetForm: () => reset(defaultFormValues)
    });

    const {actionType, handleConfirmAction, handleCancelAction} = useActionType({
        action, disabled, toggleForm, toggleModal, onCloseForm, triggerSubmit: handleSubmit(onSubmit)
    });


    const onDeleteConfirmed = useCallback(() => {
        const currentDataForDelete = watch();
        onHandleDelete(currentDataForDelete);
    }, [onHandleDelete, watch]);

    const {tutorList: tutores} = useSelector(state => state.user);
    const {data: areas = []} = useGetAreasQuery();

    return (
        <Grid container spacing={2} width='100%'>
            <Grid size={{xs: 6}}>
                <Controller
                    name="dni"
                    control={control}
                    rules={{maxLength: {value: 8, message: "Máximo 8 caracteres"}}}
                    render={({field, fieldState}) => (
                        <MyInput
                            {...field} // Esto mapea name, value, onChange, onBlur a tu MyInput
                            disabled={disabled}
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
                    render={({field}) => (
                        <MySelect
                            {...field}
                            options={areas}
                            label="Área"
                            disabled={disabled}
                            isForm
                        >
                            <MenuItem value={0}>
                                Sin Área
                            </MenuItem>
                        </MySelect>
                    )}
                />
            </Grid>
            <Grid size={{xs: 12}}>
                <Controller
                    name="name"
                    control={control}
                    rules={{
                        required: "El Nombre es obligatorio",
                        minLength: {value: 2, message: "Mínimo 2 caracteres"},
                        maxLength: {value: 50, message: "Máximo 50 caracteres"}
                    }}
                    render={({field, fieldState}) => (
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
                        pattern: {
                            value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                            message: "Formato de correo inválido"
                        }
                    }}
                    render={({field, fieldState}) => (
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
                    rules={{maxLength: {value: 9, message: "Máximo 9 caracteres"}}}
                    render={({field, fieldState}) => (
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
                    render={({field}) => (
                        <MySelect
                            {...field}
                            options={tutores}
                            label="Tutor"
                            disabled={disabled}
                            isForm
                        >
                            <MenuItem value={0}>
                                Sin Tutor
                            </MenuItem>
                        </MySelect>
                    )}
                />
            </Grid>
            <Grid size={{xs: 6}}>
                <Controller
                    name="isActive"
                    control={control}
                    render={({field}) => (
                        <MySelect
                            {...field}
                            options={studentStates} // Asegúrate de que studentStates tenga {id: valor, name: etiqueta}
                            label="Estado"
                            disabled={disabled}
                        />
                    )}
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

                content={<DeleteConfirmation
                    name={watch('name')}
                    onConfirmAction={onDeleteConfirmed}
                    onCancelAction={toggleModal}
                />}
            />
        </Grid>
    );
};
