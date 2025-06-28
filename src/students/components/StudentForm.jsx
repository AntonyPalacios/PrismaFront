import {Grid} from "@mui/material";
import {MyButton, MyInput, MySelect} from "../../components/ui/index.js";
import {areas, studentStates, tutores} from "../../assets/fakeData.jsx";
import {useContext} from "react";
import {StudentContext} from "../../context/StudentContext.jsx";
import {studentActions} from "../../reducers/studentActions.js";
import {useNavigate} from "react-router";


export const StudentForm = ({id,dni,areaId,name,email,phone,tutorId, active, onInputChange,
                                action, disabled =false, onEditForm, handleClose, onResetForm}) => {


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

    return (
        <Grid container spacing={2} width='100%' >
            <Grid size={{xs: 6}}>
                <MyInput
                    disabled={action==='edit'}
                    label="DNI"
                    value={dni}
                    name="dni"
                    handleChange={onInputChange}/>
            </Grid>
            <Grid size={{xs: 6}}>
                <MySelect
                    name="areaId"
                    options={areas}
                    label="Área"
                    disabled={disabled}
                    value={areaId}
                    handleChange={onInputChange} />
            </Grid>
            <Grid size={{xs: 12}}>
                <MyInput
                    name="name"
                    disabled={disabled}
                    label="Nombre"
                    value={name}
                    handleChange={onInputChange}/>
            </Grid>
            <Grid size={{xs: 6}}>
                <MyInput
                    name="email"
                    disabled={disabled}
                    label="Correo"
                    value={email}
                    handleChange={onInputChange}/>
            </Grid>
            <Grid size={{xs: 6}}>
                <MyInput
                    name="phone"
                    disabled={disabled}
                    label="Teléfono"
                    value={phone}
                    handleChange={onInputChange}/>
            </Grid>
            <Grid size={{xs: 6}}>
                <MySelect
                    name="tutorId"
                    options={tutores}
                    label="Tutor"
                    disabled={disabled}
                    value={tutorId}
                    handleChange={onInputChange}/>
            </Grid>
            <Grid size={{xs: 6}}>
                <MySelect
                    name="active"
                    options={studentStates}
                    label="Estado"
                    disabled={disabled}
                    value={active}
                    handleChange={onInputChange}/>
            </Grid>
            {
                action === 'edit' &&
                <Grid container size={{xs: 12}} sx={{justifyContent: 'flex-end'}}>
                    <MyButton size="small" color='error' onClick={onHandleDelete}>Borrar</MyButton>
                    <MyButton size="small" onClick={onHandleUpdate}>{disabled ? "Editar" : "Guardar"}</MyButton>
                </Grid>
            }
            {
                action === 'new' &&
                <Grid container spacing={2} size={{xs: 12}} sx={{justifyContent: 'flex-end'}}>
                    <MyButton size="small" color='error' onClick={handleClose}>Cancelar</MyButton>
                    <MyButton size="small" onClick={onHandleCreate}>Aceptar</MyButton>
                </Grid>
            }


        </Grid>
    );
};
