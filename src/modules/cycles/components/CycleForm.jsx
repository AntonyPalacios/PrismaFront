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
import {formatDateToDDMMYYYY} from "../../../helper/formatDateToDDMMYYYY.js";

const initialForm = {
    id:null,
    name: '',
    startDate:'',
    endDate:'',
}
export const CycleForm = ({cycle= initialForm, disabled = false, action="new", toggleForm, onCloseForm}) => {
    const { control, handleSubmit, watch, reset} = useForm({defaultValues:cycle});

    const {open, toggleModal,title} = useModal({title : "Confirmación"});

    const {onHandleCreate, onHandleUpdate, onHandleDelete} = useCycle({
        onCloseForm,
        toggleForm,
        onResetForm: () => reset(initialForm)
    });

    const {actionType,handleConfirmAction, handleCancelAction} = useActionType({onHandleCreate,
        onHandleUpdate, action,disabled,toggleForm,toggleModal,onCloseForm});

    useEffect(() => {
        // Solo resetea el formulario si 'cycle' no es nulo/indefinido
        // y si el formulario no está en modo 'create' o si el 'cycle.id' es diferente
        // Esto evita resetear un formulario vacío si 'cycle' es el 'initialForm' por defecto
        if (cycle && cycle.id !== null) { // Asegúrate de que 'cycle' tenga datos reales (no el initialForm vacío)
            reset(cycle); // Resetea el formulario con los datos del 'cycle' prop
        } else if (action === "new" && cycle === initialForm) {
            // Si es un formulario nuevo y el ciclo es el default vacío, asegúrate de que se resetee a vacío
            reset(initialForm);
        }
    }, [cycle, reset, action]);
    const onSubmit = useCallback((data) => {
        const transformedData = {
            ...data,
            startDate: formatDateToDDMMYYYY(data.startDate), // Transforma startDate
            endDate: formatDateToDDMMYYYY(data.endDate),     // Transforma endDate
        };
        handleConfirmAction(transformedData);
    }, [handleConfirmAction]);

    const onDeleteConfirmed = useCallback(() => {
        const currentDataForDelete = watch();
        onHandleDelete(currentDataForDelete);
    }, [onHandleDelete, watch]);
    return (
        <Grid container spacing={2}>
            <Grid size={{xs:12}}>
                <Controller
                    name="name"
                    control={control}
                    render={({field, fieldState}) =>(
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
            <Grid size={{xs:6}}>
                <Controller
                    name="startDate"
                    control={control}
                    render={({field, fieldState}) =>(
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
            <Grid size={{xs:6}}>
                <Controller
                    name="endDate"
                    control={control}
                    render={({field, fieldState}) =>(
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
