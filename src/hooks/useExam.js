import {useDispatch} from "react-redux";
import {useNavigate} from "react-router";
import {
    useCreateExamMutation,
    useDeleteExamMutation,
    useUpdateExamMutation
} from "../store/slices/exam/examApiSlice.js";
import {useCallback} from "react";
import {toggleAlert} from "../store/slices/alert/alertSlice.js";
import {formatDateToDDMMYYYY} from "../helper/formatDateToDDMMYYYY.js";

export const useExam = ({toggleForm, onCloseForm, onResetForm, action, disabled}) =>{
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [createExam] = useCreateExamMutation();
    const [updateExam] = useUpdateExamMutation();
    const [deleteExam] = useDeleteExamMutation();

    const onHandleCreate = useCallback(async (formData) => {
        try {
            await createExam(formData).unwrap(); // .unwrap() lanza el error para poderlo capturar con try/catch
            dispatch(toggleAlert({ message: 'Exámen creado correctamente', severity: 'success' }));
            onResetForm();
            onCloseForm();
        } catch (err) {
            console.error("Failed to create exam:", err);
            dispatch(toggleAlert({ message: `Error ${err.status}: ${err.message || 'Ha ocurrido un error inesperado'}`, severity: 'error' }));
        }
    },[createExam, dispatch, onResetForm, onCloseForm]);

    const onHandleUpdate = useCallback(async (formData) =>{

        try {
            await updateExam(formData).unwrap();
            dispatch(toggleAlert({ message: 'Exámen actualizado correctamente', severity: 'success' }));
        } catch (err) {
            console.error("Failed to update exam:", {err});
            dispatch(toggleAlert({ message: `Error ${err.status}: ${err.message || 'Ha ocurrido un error inesperado'}`, severity: 'error' }));
        }
        toggleForm()
    }, [dispatch, toggleForm, updateExam]);

    const onHandleDelete = useCallback(async (formData) =>{

        try {
            await deleteExam(formData.id).unwrap();
            navigate("/exams",{
                replace: true,
            })
            dispatch(toggleAlert({ message: 'Exámen borrado correctamente', severity: 'error' }));
        } catch (err) {
            console.error("Failed to delete exam:", err);
            dispatch(toggleAlert({ message: `Error ${err.status}: ${err.message || 'Ha ocurrido un error inesperado'}`, severity: 'error' }));
        }


    },[deleteExam, dispatch, navigate]);

    const onSubmit = useCallback((data) => {
        console.log("Form submitted with data (from RHF):", data);
        const transformedData = {
            ...data,
            date: formatDateToDDMMYYYY(data.date)
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