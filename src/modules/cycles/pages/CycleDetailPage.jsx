import {Grid} from "@mui/material";
import {CycleForm} from "../components/CycleForm.jsx";
import {MyTitle} from "../../../components/ui/index.js";
import {StageTable} from "../components/StageTable.jsx";
import {useParams} from "react-router";
import {cycles} from "../../../assets/fakeData.jsx";
import {useState} from "react";

export const CycleDetailPage = () => {
    const {id} = useParams();

    /*useEffect(() => {
        //obtener usuario por id desde el backend

    },[id])*/
    const cycle = cycles.find((cycle) => cycle.id === parseInt(id));
    const [disabled, setDisabled] = useState(true)
    const toggleForm = () =>{
        setDisabled(!disabled);
    }
    return (
        <Grid container spacing={2}>
            <MyTitle>Ciclos</MyTitle>
            <CycleForm cycle={cycle} disabled={disabled} toggleForm={toggleForm}/>
            <MyTitle>Etapas</MyTitle>
            <StageTable idCycle={parseInt(id)}/>
        </Grid>
    );
};
