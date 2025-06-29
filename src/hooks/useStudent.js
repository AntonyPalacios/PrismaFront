import {useContext} from "react";
import {StudentContext} from "../context/StudentContext.jsx";
import {useNavigate} from "react-router";
import {areas, tutores} from "../assets/fakeData.jsx";
import {studentActions} from "../reducers/studentActions.js";

export const useStudent = ({id,dni,areaId,name,email,phone,tutorId, active,
                               disabled =false, onEditForm, handleClose, onResetForm}) => {
    const {onCreateStudent, onUpdateStudent, onDeleteStudent} = useContext(StudentContext);
    const navigate = useNavigate()

    const onHandleCreate = () => {
        const student = {
            id: new Date().getTime(),
            dni,
            name,
            area: areas.filter(area => area.id === areaId)[0],
            phone,
            email,
            tutor: tutores.filter(tutor => tutor.id === tutorId)[0],
            active,
        }

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
        handleClose();
    }

    const onHandleUpdate = () =>{
        if(disabled){
            onEditForm();
            return;
        }
        const student = {
            id,
            dni,
            name,
            area: areas.filter(area => area.id === areaId)[0],
            phone,
            email,
            tutor: tutores.filter(tutor => tutor.id === tutorId)[0],
            active,
        }

        //buscar en la lista de alumnos y reemplazar el dato
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

        onEditForm();
    }

    const onHandleDelete = () =>{
        const action = {
            type:studentActions.delete,
            payload: {id,
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
