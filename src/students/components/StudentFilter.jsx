import {Grid, TextField} from "@mui/material";
import {MyButton} from "../../components/ui/MyButton.jsx";
import {Search} from '@mui/icons-material';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import {etapas,areas,tutores} from "../../assets/fakeData.jsx";
import {useState} from "react";

export const StudentFilter = ({isLargeScreen}) => {
    const [age, setAge] = useState('');
    return (
        <Grid container spacing={2} width="100%">
            <Grid size={{xs: 6, md: 2, xl: 2}}>
                <FormControl fullWidth size="small">
                    <InputLabel id="demo-simple-select-label">Ciclo</InputLabel>
                    <Select
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        value={age}
                        label="Ciclo"
                        //onChange={handleChange}
                    >
                        {etapas.map((etapa)=>
                            <MenuItem key={etapa.id} value={etapa.id}>{etapa.etapa}</MenuItem>
                        )}
                    </Select>
                </FormControl>
            </Grid>
            <Grid size={{xs: 6, md: 2}}>
                <FormControl fullWidth size="small">
                    <InputLabel id="demo-simple-select-label" >Área</InputLabel>
                    <Select
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        value={age}
                        label="Área"
                        //onChange={handleChange}
                    >
                        {areas.map((area)=>
                            <MenuItem key={area.id} value={area.id}>{area.area}</MenuItem>
                        )}
                    </Select>
                </FormControl>
            </Grid>
            <Grid size={{xs: 12, md: 2}}>
                <FormControl fullWidth size="small">
                    <InputLabel id="demo-simple-select-label" >Tutor</InputLabel>
                    <Select
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        value={age}
                        label="Tutor"
                        //onChange={handleChange}
                    >
                        {tutores.map((tutor)=>
                            <MenuItem key={tutor.id} value={tutor.id}>{tutor.name}</MenuItem>
                        )}
                    </Select>
                </FormControl>
            </Grid>
            <Grid size={{xs: 12, md: 6}} sx={{display: 'flex', gap: 1, justifyContent: 'space-between'}}>
                <TextField size="small" fullWidth label="Nombre" variant="outlined"/>
                <MyButton size="small">{isLargeScreen ? "Buscar" : <Search/>}</MyButton>
            </Grid>
        </Grid>
    );
};
