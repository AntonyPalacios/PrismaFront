import {useContext} from "react";
import {StudentContext} from "../context/StudentContext.jsx";
import {useNavigate} from "react-router";
import {studentActions} from "../reducers/studentActions.js";


export const useStudent = ({studentForm, toggleForm, onCloseForm, onResetForm}) => {
    const {onCreateStudent, onUpdateStudent, onDeleteStudent} = useContext(StudentContext);
    const navigate = useNavigate()

    const buildStudentObject = (override = {}) => ({
        id: override.id ?? studentForm.id ?? new Date().getTime(),
        dni: override.dni ?? studentForm.dni,
        name: override.name ?? studentForm.name,
        areaId: override.areaId ?? studentForm.areaId,
        phone: override.phone ?? studentForm.phone,
        email: override.email ?? studentForm.email,
        tutorId: override.tutorId ?? studentForm.tutorId,
        active: override.active ?? studentForm.active,
    });

    const onHandleCreate = () => {
        const student = buildStudentObject({ id: new Date().getTime() });

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
    }

    const onHandleUpdate = () =>{
        const student = buildStudentObject();

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
    }

    const onHandleDelete = () =>{
        const action = {
            type:studentActions.delete,
            payload: {id:studentForm.id,
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
    }
    return{
        onHandleCreate,
        onHandleUpdate,
        onHandleDelete
    }
}
