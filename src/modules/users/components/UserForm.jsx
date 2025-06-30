import {FormControlLabel, Grid, Switch} from "@mui/material";
import {MyButton, MyInput} from "../../../components/ui/index.js";
import {useForm} from "../../../hooks/useForm.js";
import {MySwitch} from "../../../components/ui/MySwitch.jsx";
import {MyActionButtons} from "../../../components/ui/MyActionButtons.jsx";

export const UserForm = ({user={}, disabled=false, toggleForm}) => {

    const {id,name,email,isAdmin,isTutor,isActive,onInputChange} = useForm(user)

    return (
        <Grid container spacing={2}>

            <Grid size={{xs: 12}}>
                <MyInput
                    disabled={disabled}
                    label="Nombre"
                    value={name}
                    name="name"
                    handleChange={onInputChange}
                />
            </Grid>
            <Grid size={{xs: 12}}>
                <MyInput
                    disabled={disabled}
                    label="Correo"
                    value={email}
                    name="email"
                    handleChange={onInputChange}
                />
            </Grid>
            <Grid size={{xs: 4}} display="flex" justifyContent="center">
                    <MySwitch
                        label="Admin"
                        disabled={disabled}
                        checked={Boolean(isAdmin)}
                        name="isAdmin"
                        onInputChange={onInputChange}
                        value={Boolean(isAdmin)}
                    />
            </Grid>
            <Grid size={{xs: 4}} display="flex" justifyContent="center">
                <MySwitch
                    label="Tutor"
                    disabled={disabled}
                    checked={Boolean(isTutor)}
                    name="isTutor"
                    onInputChange={onInputChange}
                    value={Boolean(isTutor)}
                />
            </Grid>
            <Grid size={{xs: 4}} display="flex" justifyContent="center">
                <MySwitch
                    label="Activo"
                    disabled={disabled}
                    checked={Boolean(isActive)}
                    name="isActive"
                    onInputChange={onInputChange}
                    value={Boolean(isActive)}
                />
            </Grid>

            <MyActionButtons/>
        </Grid>
    );
};
