import {useCallback} from "react";
import {useNavigate} from "react-router";
import {useDispatch} from "react-redux";
import {onCreateStudent, onDeleteStudent, onUpdateStudent} from "../store/slices/student/studentSlice.js";


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

    const onHandleCreate = useCallback(async (formData) => {

        const student = buildStudentObject(formData, {id: new Date().getTime()});

        await dispatch(onCreateStudent(student))
        onResetForm()
        onCloseForm();
    }, [dispatch, onResetForm, onCloseForm]);

    const onHandleUpdate = useCallback(async (formData) => {

        const student = buildStudentObject(formData);

        await dispatch(onUpdateStudent(student));
        toggleForm();
    }, [dispatch, toggleForm]);

    const onHandleDelete = useCallback(async (formData) => {

        await dispatch(onDeleteStudent(formData.id))
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
