import {useContext, useState} from "react";
import {Grid} from "@mui/material";
import {MyButton, MyInput, MySelect} from "../../../components/ui/index.js";
import Search from '@mui/icons-material/Search';
import {areas, stages, tutores} from "../../../assets/fakeData.jsx";
import {AppContext} from "../../../context/AppContext.jsx";

export const StudentFilter = () => {
    const [age, setAge] = useState('');
    const {isLargeScreen} = useContext(AppContext);
    return (
        <Grid container spacing={2} width="100%">
            <Grid size={{xs: 6, md: 2, xl: 2}}>
                <MySelect options={stages} label="Ciclo" value={age}/>
            </Grid>
            <Grid size={{xs: 6, md: 2}}>
                <MySelect options={areas} label="Área" value={age}/>
            </Grid>
            <Grid size={{xs: 12, md: 2}}>
                <MySelect options={tutores} label="Tutor" value={age}/>

            </Grid>
            <Grid size={{xs: 12, md: 6}} sx={{display: 'flex', gap: 1, justifyContent: 'space-between'}}>
                <MyInput label="Nombre" value={age}/>
                <MyButton size="small">{isLargeScreen ? "Buscar" : <Search/>}</MyButton>
            </Grid>
        </Grid>
    );
};
