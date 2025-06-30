import {Grid} from "@mui/material";
import {MyInput} from "../../../components/ui/index.js";
import {MyActionButtons} from "../../../components/ui/MyActionButtons.jsx";

export const StageForm = ({id}) => {
    return (
        <Grid container spacing={2}>
            <Grid size={{xs:12}}>
                <MyInput
                label="Nombre"
                name="name"
                />
            </Grid>
            <Grid size={{xs:12}}>
                <MyInput
                    label="Fecha Inicio"
                    type="date"
                    InputLabelProps={{
                        shrink: true,
                    }}
                />
            </Grid>
            <Grid size={{xs:12}}>
                <MyInput
                    label="Fecha Fin"
                    type="date"
                    InputLabelProps={{
                        shrink: true,
                    }}
                />
            </Grid>
            <MyActionButtons />
        </Grid>
    );
};
