import {useCallback} from "react";
import {useDispatch} from "react-redux";
import {toggleAlert} from "../store/slices/alert/alertSlice.js";
import {
    useCreateStageMutation,
    useDeleteStageMutation,
    useUpdateStageMutation
} from "../store/slices/cycle/cycleApiSlice.js";
import {resetSelectedStage, setSelectedStage} from "../store/slices/cycle/cycleSlice.js";
import {formatDateToDDMMYYYY} from "../helper/formatDateToDDMMYYYY.js";

export const useStage = ({ onCloseForm, onResetForm, action, disabled}) => {
    const dispatch = useDispatch();

    const [createStage] = useCreateStageMutation();
    const [updateStage] = useUpdateStageMutation();
    const [deleteStage] = useDeleteStageMutation();


    const onHandleCreate = useCallback(async (formData) => {
        try {
            await createStage(formData).unwrap(); // .unwrap() lanza el error para poderlo capturar con try/catch
            dispatch(toggleAlert({ message: 'Etapa creada correctamente', severity: 'success' }));
            onResetForm();
            onCloseForm();
        } catch (err) {
            dispatch(toggleAlert({ message: err, severity: 'error' }));
        }
    },[createStage, dispatch, onResetForm, onCloseForm]);

    const onHandleUpdate = useCallback(async (formData) =>{

        try {
            await updateStage(formData).unwrap();
            dispatch(toggleAlert({ message: 'Etapa actualizada correctamente', severity: 'success' }));
            // toggleForm()
            onResetForm();
            onCloseForm();
        } catch (err) {
            dispatch(toggleAlert({ message: err, severity: 'error' }));
        }
    }, [dispatch, onCloseForm, onResetForm, updateStage]);

    const onHandleDelete = useCallback(async (formData) =>{

        try {
            await deleteStage(formData.id).unwrap();
            dispatch(resetSelectedStage(formData.idCycle));
            dispatch(toggleAlert({ message: 'Etapa borrada correctamente', severity: 'error' }));
            onResetForm();
            onCloseForm();
        } catch (err) {
            dispatch(toggleAlert({ message: err, severity: 'error' }));
        }


    },[deleteStage, dispatch, onCloseForm, onResetForm]);

    const onSubmit = useCallback((data) => {
        console.log("Form submitted with data (from RHF):", data);
        const transformedData = {
            ...data,
            startDate: formatDateToDDMMYYYY(data.startDate),
            endDate: formatDateToDDMMYYYY(data.endDate),
        };
        if(action === "new") {
            onHandleCreate(transformedData);
        }else if (action === "edit" && !disabled){
            onHandleUpdate(transformedData);
        }
    }, [action, disabled, onHandleCreate, onHandleUpdate]);


    return{
        onSubmit,
        onHandleDelete
    }
}