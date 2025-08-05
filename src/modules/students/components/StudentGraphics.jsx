import {Grid} from "@mui/material";
import {MySelect, MyTitle} from "../../../components/ui/index.js";
import { ExamGraphic} from "./ExamGraphic.jsx";
import {useState} from "react";
import {ExamEffectiveGraphic} from "./ExamEffectiveGraphic.jsx";
import {ExamEffectiveByCourseGraphic} from "./ExamEffectiveByCourseGraphic.jsx";

const options = [
    {id:1,name:"Puntaje Total"},
    {id:2,name:"Efectivas Total"},
    {id:3,name:"Efectivas por curso"},
]


export const StudentGraphics = () => {

    const [graphType, setGraphType] = useState(1);

    const handleGraphType = (event) =>{
        setGraphType(event.target.value);
    }

    const renderGraphic = () => {
        switch (graphType) {
            case 1:
                return <ExamGraphic />;
            case 2:
                return <ExamEffectiveGraphic />;
            case 3:
                return <ExamEffectiveByCourseGraphic />;
            default:
                return null;
        }
    };
    return (
        <Grid container spacing={2} width="100%">
            <Grid size={12}>
                <MyTitle>Gráficos</MyTitle>
            </Grid>
            <Grid size={{xs:6, lg:3}}>
                <MySelect
                    label="Gráfico"
                    options={options}
                    value={graphType}
                    onChange={handleGraphType}
                    isForm={true}
                />
            </Grid>
            <Grid size={12} >
                {renderGraphic()}
            </Grid>
        </Grid>
    );
};
