import {useCallback} from "react";
import {useNavigate} from "react-router";
import {useDispatch} from "react-redux";

import {
    useCreateCycleMutation,
    useDeleteCycleMutation,
    useUpdateCycleMutation
} from "../store/slices/cycle/cycleApiSlice.js";
import {toggleAlert} from "../store/slices/alert/alertSlice.js";
import {formatDateToDDMMYYYY} from "../helper/formatDateToDDMMYYYY.js";

export const useCycle = ({toggleForm, onCloseForm, onResetForm, action, disabled})=>{
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [createCycle] = useCreateCycleMutation();
    const [updateCycle] = useUpdateCycleMutation();
    const [deleteCycle] = useDeleteCycleMutation();


    const onHandleCreate = useCallback(async (formData) => {
        try {
            await createCycle(formData).unwrap(); // .unwrap() lanza el error para poderlo capturar con try/catch
            dispatch(toggleAlert({ message: 'Ciclo creado correctamente', severity: 'success' }));
            onResetForm();
            onCloseForm();
        } catch (err) {
            dispatch(toggleAlert({ message: err, severity: 'error' }));
        }
    },[createCycle, dispatch, onResetForm, onCloseForm]);

    const onHandleUpdate = useCallback(async (formData) =>{

        try {
            await updateCycle(formData).unwrap();
            dispatch(toggleAlert({ message: 'Ciclo actualizado correctamente', severity: 'success' }));
            toggleForm()
        } catch (err) {
            dispatch(toggleAlert({ message: err, severity: 'error' }));
        }
    }, [dispatch, toggleForm, updateCycle]);

    const onHandleDelete = useCallback(async (formData) =>{

        try {
            await deleteCycle(formData.id).unwrap();
            navigate("/cycles",{
                replace: true,
            })
            dispatch(toggleAlert({ message: 'Ciclo borrado correctamente', severity: 'error' }));
        } catch (err) {
            dispatch(toggleAlert({ message: err, severity: 'error' }));
        }


    },[deleteCycle, dispatch, navigate]);

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