import {Grid} from "@mui/material";
import {MyInput} from "../../../components/ui/index.js";
import {MyActionButtons} from "../../../components/ui/MyActionButtons.jsx";

export const CycleForm = ({cycle, disabled, toggleForm}) => {
    return (
        <Grid container spacing={2}>
            <Grid size={{xs:12}}>
                <MyInput
                    label="Nombre"
                    name="name"
                    value={cycle.name}
                    disabled={disabled}
                />
            </Grid>
            <Grid size={{xs:6}}>
                <MyInput
                    label="Fecha Inicio"
                    type="date"
                    value={cycle.initDate}
                    disabled={disabled}
                    InputLabelProps={{
                        shrink: true,
                    }}
                />
            </Grid>
            <Grid size={{xs:6}}>
                <MyInput
                    label="Fecha Fin"
                    type="date"
                    value={cycle.endDate}
                    disabled={disabled}
                    InputLabelProps={{
                        shrink: true,
                    }}
                />
            </Grid>
            <MyActionButtons onConfirmAction={toggleForm}/>
        </Grid>
    );
};
