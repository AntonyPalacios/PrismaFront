import {useLocation} from "react-router";
import {Grid, TextField} from "@mui/material";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import {areas, tutores} from "../../assets/fakeData.jsx";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import {MyButton} from "../../components/ui/MyButton.jsx";

export const StudentDetail = () => {
    const location = useLocation();
    const {student} = location.state;

    return (
        <Grid container spacing={2} width='100%' sx={{border: '1px dashed red'}}>
            <Grid size={{xs: 6}}>
                <TextField size="small" fullWidth label="DNI" variant="outlined"/>
            </Grid>
            <Grid size={{xs: 6}}>
                <FormControl fullWidth size="small">
                    <InputLabel id="demo-simple-select-label">Área</InputLabel>
                    <Select
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        value={1}
                        label="Área"
                        //onChange={handleChange}
                    >
                        {areas.map((area) =>
                            <MenuItem key={area.id} value={area.id}>{area.area}</MenuItem>
                        )}
                    </Select>
                </FormControl>
            </Grid>
            <Grid size={{xs: 12}}>
                <TextField size="small" fullWidth label="Nombre" variant="outlined"/>
            </Grid>
            <Grid size={{xs: 6}}>
                <TextField size="small" fullWidth label="Correo" variant="outlined"/>
            </Grid>
            <Grid size={{xs: 6}}>
                <TextField size="small" fullWidth label="Telefono" variant="outlined"/>
            </Grid>
            <Grid size={{xs: 6}}>
                <FormControl fullWidth size="small">
                    <InputLabel id="demo-simple-select-label">Tutor</InputLabel>
                    <Select
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        value={1}
                        label="Tutor"
                        //onChange={handleChange}
                    >
                        {tutores.map((tutor) =>
                            <MenuItem key={tutor.id} value={tutor.id}>{tutor.name}</MenuItem>
                        )}
                    </Select>
                </FormControl>
            </Grid>
            <Grid size={{xs: 6}}>
                <FormControl fullWidth size="small">
                    <InputLabel id="demo-simple-select-label">Estado</InputLabel>
                    <Select
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        value={1}
                        label="Estado"
                        //onChange={handleChange}
                    >
                        <MenuItem value={1}>Activo</MenuItem>
                        <MenuItem value={0}>Inactivo</MenuItem>

                    </Select>
                </FormControl>
            </Grid>
            <Grid container size={{xs: 12}} sx={{justifyContent: 'flex-end'}} >
                <MyButton size="small" color='error'>Borrar</MyButton>
                <MyButton size="small">Editar</MyButton>
            </Grid>

        </Grid>
    );
};
