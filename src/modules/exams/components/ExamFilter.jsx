import {Grid} from "@mui/material";
import {MyButton, MyInput, MySelect} from "../../../components/ui/index.js";
import {useContext} from "react";
import Search from '@mui/icons-material/Search';
import {AppContext} from "../../../context/AppContext.jsx";

export const ExamFilter = () => {
    const {isLargeScreen} = useContext(AppContext);
    return (
        <Grid container spacing={2}>
            <Grid size={{xs:3,md:6}}>
                <MySelect
                    label="Ciclo"
                />
            </Grid>
            <Grid size={{xs:3,md:6}}>
                <MySelect
                    label="Etapa"
                />
            </Grid>
            <Grid size={{xs:4,md:10}}>
                <MyInput
                    label="Nombre"
                    name="name"
                />
            </Grid>
            <Grid size={{xs:2,md:2}} display="flex" justifyContent="flex-end">
                <MyButton>{isLargeScreen?"Buscar":<Search/>}</MyButton>
            </Grid>
        </Grid>
    );
};
