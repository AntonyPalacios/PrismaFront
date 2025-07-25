import {Grid} from "@mui/material";
import {MyInput} from "../../../components/ui/index.js";
import {MyActionButtons} from "../../../components/ui/MyActionButtons.jsx";
import {Controller, useForm} from "react-hook-form";
import {DeleteConfirmation} from "../../../components/layout/DeleteConfirmation.jsx";
import MyModal from "../../../components/ui/MyModal.jsx";
import {useActionType} from "../../../hooks/useActionType.js";
import {useCallback, useEffect} from "react";
import {useModal} from "../../../hooks/useModal.js";
import {useCycle} from "../../../hooks/useCycle.js";

const initialForm = {
    id: null,
    name: '',
    startDate: '',
    endDate: '',
}
export const CycleForm = ({cycle = initialForm, disabled = false, action = "new", toggleForm, onCloseForm}) => {
    const {control, handleSubmit, watch, reset} = useForm({defaultValues: cycle});

    const {open, toggleModal, title} = useModal({title: "Confirmación"});

    const {onSubmit, onHandleDelete} = useCycle({
        action,
        disabled,
        onCloseForm,
        toggleForm,
        onResetForm: () => reset(initialForm)
    });

    const {actionType, handleConfirmAction, handleCancelAction} = useActionType({
        action, disabled, toggleForm, toggleModal, onCloseForm, triggerSubmit: handleSubmit(onSubmit)
    });

    useEffect(() => {
        if (cycle && cycle.id !== null) {
            reset(cycle);
        } else if (action === "new" && cycle === initialForm) {
            reset(initialForm);
        }
    }, [cycle, reset, action]);

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
                    rules={{
                        required: "El Nombre es obligatorio",
                        minLength: {value: 4, message: "Mínimo 4 caracteres"},
                        maxLength: {value: 15, message: "Máximo 15 caracteres"}
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
                    name="startDate"
                    control={control}
                    render={({field, fieldState}) => (
                        <MyInput
                            {...field}
                            label="Fecha Inicio"
                            type="date"
                            InputLabelProps={{
                                shrink: true,
                            }}
                            disabled={disabled}
                            error={!!fieldState.error}
                            helperText={fieldState.error?.message}
                        />
                    )}
                />

            </Grid>
            <Grid size={{xs: 6}}>
                <Controller
                    name="endDate"
                    control={control}
                    render={({field, fieldState}) => (
                        <MyInput
                            {...field}
                            label="Fecha Fin"
                            type="date"
                            InputLabelProps={{
                                shrink: true,
                            }}
                            disabled={disabled}
                            error={!!fieldState.error}
                            helperText={fieldState.error?.message}
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
