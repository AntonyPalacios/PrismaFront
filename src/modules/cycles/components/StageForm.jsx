import {Grid} from "@mui/material";
import {MyInput} from "../../../components/ui/index.js";
import {MyActionButtons} from "../../../components/ui/MyActionButtons.jsx";
import {Controller, useForm} from "react-hook-form";
import {useCallback, useEffect, useState} from "react";
import {useActionType} from "../../../hooks/useActionType.js";
import {useStage} from "../../../hooks/useStage.js";
import {useSelector} from "react-redux";
import {formatDateToYYYYMMDD} from "../../../helper/formatDateToYYYYMMDD.js";
import {DeleteConfirmation} from "../../../components/layout/DeleteConfirmation.jsx";
import MyModal from "../../../components/ui/MyModal.jsx";
import {useModal} from "../../../hooks/useModal.js";


export const StageForm = ({disabled = false, toggleForm, onCloseForm}) => {

    const {open, toggleModal, title} = useModal({title: "Confirmación"});

    const {selectedStage} = useSelector(state => state.cycle)
    let stage = {
        ...selectedStage,
        startDate: formatDateToYYYYMMDD(selectedStage.startDate),
        endDate: formatDateToYYYYMMDD(selectedStage.endDate),
    }
    const [action, setAction] = useState("new")
    useEffect(() => {
        if (selectedStage.id === null) {
            setAction("new")
        } else {
            setAction("edit")
        }
    }, [selectedStage])

    const {control, watch, handleSubmit, reset} = useForm({
        defaultValues: stage,
    });

    const {onSubmit, onHandleDelete} = useStage({
        action,
        disabled,
        onCloseForm,
        onResetForm: () => reset(stage)
    });

    const {actionType, handleConfirmAction, handleCancelAction} = useActionType({
        action, disabled, toggleModal, toggleForm, onCloseForm, triggerSubmit: handleSubmit(onSubmit)
    });


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
            <Grid size={{xs: 12}}>
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
            <Grid size={{xs: 12}}>
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
