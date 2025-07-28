import {Grid} from "@mui/material";
import {MyInput, MySelect} from "../../../components/ui/index.js";
import {MyActionButtons} from "../../../components/ui/MyActionButtons.jsx";
import {exams} from "../../../assets/fakeData.jsx";
import {useCallback, useEffect, useState} from "react";
import {Controller, useForm} from "react-hook-form";
import {useUser} from "../../../hooks/useUser.js";
import {useExam} from "../../../hooks/useExam.js";
import {useActionType} from "../../../hooks/useActionType.js";
import {useModal} from "../../../hooks/useModal.js";
import MenuItem from "@mui/material/MenuItem";
import {useGetStagesQuery} from "../../../store/slices/cycle/cycleApiSlice.js";
import {useSelector} from "react-redux";
import {DeleteConfirmation} from "../../../components/layout/DeleteConfirmation.jsx";
import MyModal from "../../../components/ui/MyModal.jsx";
import {formatDateToYYYYMMDD} from "../../../helper/formatDateToYYYYMMDD.js";

let initialForm = {
    id:null,
    name:'',
    date:null,
    stageId:null
}

export const ExamForm = ({ disabled = false, toggleForm, onCloseForm}) => {
    const {selectedExam} = useSelector(state => state.exam)
    let exam = {
        ...selectedExam,
        date: formatDateToYYYYMMDD(selectedExam.date),
    }

    const [action, setAction] = useState("new")
    useEffect(() => {
        if (selectedExam.id === null) {
            setAction("new")
        } else {
            setAction("edit")
        }
    }, [selectedExam])

    const {control, watch, handleSubmit, reset} = useForm({
        defaultValues: exam,
    });


    const {open, toggleModal, title} = useModal({title: "Confirmación"});
    const {currentCycle} = useSelector((state) => state.cycle)

    const {data:stages} = useGetStagesQuery(currentCycle.id);

    const {onSubmit, onHandleDelete} = useExam({
        action,
        disabled,
        onCloseForm,
        toggleForm,
        onResetForm: () => reset(initialForm)
    });

    const {actionType, handleConfirmAction, handleCancelAction} = useActionType({
        action, disabled, toggleForm, toggleModal, onCloseForm, triggerSubmit: handleSubmit(onSubmit)
    });

    const onDeleteConfirmed = useCallback(() => {
        const currentDataForDelete = watch();
        onHandleDelete(currentDataForDelete);
    }, [onHandleDelete, watch]);

    return (
        <Grid container spacing={2}>
            <Grid size={{xs:12, md:12}}>
                <Controller
                    name="name"
                    control={control}
                    rules={{
                        required: "El Nombre es obligatorio",
                        minLength: {value: 3, message: "Mínimo 3 caracteres"},
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
            <Grid size={{xs:12, md:6}}>
                <Controller
                    name="date"
                    control={control}
                    render={({field, fieldState}) => (
                        <MyInput
                            {...field}
                            label="Fecha "
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
            <Grid size={{xs:12, md:6}}>
                <Controller
                    name="stageId"
                    control={control}
                    render={({field}) => (
                        <MySelect
                            {...field}
                            options={stages}
                            label="Etapa"
                            disabled={action==="edit"}
                            isForm={true}
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
