import {Grid} from "@mui/material";
import {MyButton, MyInput, MySelect} from "../../components/ui/index.js";
import {areas, studentStates, tutores} from "../../assets/fakeData.jsx";


export const StudentForm = ({id,dni,areaId,name,email,phone,tutorId, active, onInputChange,
                                action, disabled =false, onHandleConfirm, onHandleCancel, onEditForm}) => {


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
                    <MyButton size="small" color='error' onClick={onHandleCancel}>Borrar</MyButton>
                    <MyButton size="small" onClick={onHandleConfirm}>{disabled ? "Editar" : "Guardar"}</MyButton>
                </Grid>
            }
        </Grid>
    );
};
