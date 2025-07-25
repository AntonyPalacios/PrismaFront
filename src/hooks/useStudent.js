import {useCallback} from "react";
import {useNavigate} from "react-router";
import {useDispatch} from "react-redux";
import {
    useCreateStudentMutation,
    useDeleteStudentMutation,
    useUpdateStudentMutation
} from "../store/slices/student/studentsApiSlice.js";
import {toggleAlert} from "../store/slices/alert/alertSlice.js";


export const useStudent = ({toggleForm, onCloseForm, onResetForm, action, disabled}) => {

    const dispatch = useDispatch();
    const navigate = useNavigate()

    const [createStudent] = useCreateStudentMutation();
    const [updateStudent] = useUpdateStudentMutation();
    const [deleteStudent] = useDeleteStudentMutation();

    const onHandleCreate = useCallback(async (formData) => {
        formData = {
            ...formData,
            isActive: formData.isActive === 1
        }

        try {
            await createStudent(formData).unwrap(); // .unwrap() lanza el error para poderlo capturar con try/catch
            dispatch(toggleAlert({ message: 'Alumno creado correctamente', severity: 'success' }));
            onResetForm();
            onCloseForm();
        } catch (err) {
            console.error("Failed to create student:", err);
            dispatch(toggleAlert({ message: `Error ${err.status}: ${err.message || 'Ha ocurrido un error inesperado'}`, severity: 'error' }));
        }
    }, [createStudent, dispatch, onResetForm, onCloseForm]);

    const onHandleUpdate = useCallback(async (formData) => {
        formData = {
            ...formData,
            isActive: formData.isActive === 1
        }
        try {
            await updateStudent(formData).unwrap();
            dispatch(toggleAlert({ message: 'Alumno actualizado correctamente', severity: 'success' }));
        } catch (err) {
            console.error("Failed to update student:", err);
            dispatch(toggleAlert({ message: `Error ${err.status}: ${err.message || 'Ha ocurrido un error inesperado'}`, severity: 'error' }));
        }
        toggleForm()
    }, [dispatch, toggleForm, updateStudent]);

    const onHandleDelete = useCallback(async (formData) => {

        try {
            await deleteStudent(formData.id).unwrap();
            navigate("/students",{
                replace: true,
            })
            dispatch(toggleAlert({ message: 'Alumno borrado correctamente', severity: 'error' }));
        } catch (err) {
            console.error("Failed to delete student:", err);
            dispatch(toggleAlert({ message: `Error ${err.status}: ${err.message || 'Ha ocurrido un error inesperado'}`, severity: 'error' }));
        }
    }, [deleteStudent, dispatch, navigate]);

    const onSubmit = useCallback((data) => {
        console.log("Form submitted with data (from RHF):", data);

        if(action === "new") {
            onHandleCreate(data);
        }else if (action === "edit" && !disabled){
            onHandleUpdate(data);
        }
    }, [action, disabled, onHandleCreate, onHandleUpdate]);

    return {
        onSubmit,
        onHandleDelete
    }
}
