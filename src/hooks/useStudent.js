import {useCallback, useContext} from "react";
import {StudentContext} from "../context/StudentContext.jsx";
import {useNavigate} from "react-router";
import {studentActions} from "../reducers/studentActions.js";


export const useStudent = ({toggleForm, onCloseForm, onResetForm}) => {
    const {onCreateStudent, onUpdateStudent, onDeleteStudent} = useContext(StudentContext);
    const navigate = useNavigate()

    const buildStudentObject = (currentFormState,override = {}) => ({
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

        const student = buildStudentObject(formData,{ id: new Date().getTime() });

        const action = {
            type:studentActions.create,
            payload: {
                student,
                studentAlert:{
                    open:true,
                    message:"Alumno creado correctamente",
                    severity:"success",
                }
            }
        }
        onCreateStudent(action)
        onResetForm()
        onCloseForm();
    },[onCreateStudent, onResetForm, onCloseForm]);

    const onHandleUpdate = useCallback((formData) =>{

        const student = buildStudentObject(formData);

        const action = {
            type:studentActions.update,
            payload: {
                student,
                studentAlert:{
                    open:true,
                    message:"Alumno actualizado correctamente",
                    severity:"success",
                }
            }}
        onUpdateStudent(action);
        toggleForm();
    }, [onUpdateStudent, toggleForm]);

    const onHandleDelete = useCallback((formData) =>{

        const action = {
            type:studentActions.delete,
            payload: {id:formData.id,
                studentAlert:{
                    open:true,
                    message:"Alumno borrado correctamente",
                    severity:"error",
                }
            }}
        onDeleteStudent(action)
        navigate("/students",{
            replace: true,
        })
    },[navigate, onDeleteStudent]);
    
    return{
        onHandleCreate,
        onHandleUpdate,
        onHandleDelete
    }
}
