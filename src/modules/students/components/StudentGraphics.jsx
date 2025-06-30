import {Grid} from "@mui/material";
import {MySelect, MyTitle} from "../../../components/ui/index.js";

const options = [
    {id:1,name:"Puntaje Total"},
    {id:2,name:"Efectivas Total"},
    {id:3,name:"Efectivas por curso"},
]

export const StudentGraphics = () => {
    return (
        <Grid container spacing={2} width="100%">
            <Grid size={12}>
                <MyTitle>Gráficos</MyTitle>
            </Grid>
            <Grid size={{xs:6, lg:3}}>
                <MySelect
                    label="Gráfico"
                    options={options}
                    value={1}
                />
            </Grid>
        </Grid>
    );
};
