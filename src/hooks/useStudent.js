import {useCallback} from "react";
import {useNavigate} from "react-router";
import {useDispatch} from "react-redux";
import {onCreateStudent, onDeleteStudent, onUpdateStudent} from "../store/slices/student/studentSlice.js";
import {toggleAlert} from "../store/slices/alert/alertSlice.js";


export const useStudent = ({toggleForm, onCloseForm, onResetForm}) => {

    const dispatch = useDispatch();
    const navigate = useNavigate()

    const buildStudentObject = (currentFormState, override = {}) => ({
        id: override.id ?? currentFormState.id ?? new Date().getTime(),
        dni: override.dni ?? currentFormState.dni,
        name: override.name ?? currentFormState.name,
        areaId: override.areaId ?? currentFormState.areaId,
        phone: override.phone ?? currentFormState.phone,
        email: override.email ?? currentFormState.email,
        tutorId: override.tutorId ?? currentFormState.tutorId,
        active: override.active ?? currentFormState.active,
    });

    const onHandleCreate = useCallback((formData) => {

        const student = buildStudentObject(formData, {id: new Date().getTime()});

        dispatch(onCreateStudent(student))
        dispatch(toggleAlert({
            message:'Alumno creado correctamente',
            severity: 'success',
        }));
        onResetForm()
        onCloseForm();
    }, [dispatch, onResetForm, onCloseForm]);

    const onHandleUpdate = useCallback((formData) => {

        const student = buildStudentObject(formData);

        dispatch(onUpdateStudent(student));
        dispatch(toggleAlert({
            message:'Alumno actualizado correctamente',
            severity: 'success',
        }));
        toggleForm();
    }, [dispatch, toggleForm]);

    const onHandleDelete = useCallback((formData) => {

        dispatch(onDeleteStudent(formData.id))
        dispatch(toggleAlert({
            message:'Alumno borrado correctamente',
            severity: 'error',
        }));
        navigate("/students", {
            replace: true,
        })
    }, [dispatch, navigate]);

    return {
        onHandleCreate,
        onHandleUpdate,
        onHandleDelete
    }
}
