import {CircularProgress, Grid} from "@mui/material";
import {CycleForm} from "../components/CycleForm.jsx";
import {MyTitle} from "../../../components/ui/index.js";
import {StageTable} from "../components/StageTable.jsx";
import {useParams} from "react-router";
import {useEffect, useState} from "react";
import {toggleAlert} from "../../../store/slices/alert/alertSlice.js";
import {MyAlert} from "../../../components/ui/MyAlert.jsx";
import {useDispatch, useSelector} from "react-redux";
import {useGetCyclesQuery} from "../../../store/slices/cycle/cycleApiSlice.js";
import {formatDateToYYYYMMDD} from "../../../helper/formatDateToYYYYMMDD.js";

export const CycleDetailPage = () => {
    const {id} = useParams();

    const {message,severity,open} = useSelector(state => state.alert);
    const dispatch = useDispatch();

    const {data:cycles=[], isLoading, isSuccess} = useGetCyclesQuery();
    const [transformedCycle, setTransformedCycle] = useState(null);

    const cycle = cycles.find((c) => c.id === parseInt(id));
    useEffect(() => {
        if (isSuccess && cycle) {
            // Transforma las fechas del ciclo encontrado
            const cycleWithFormattedDates = {
                ...cycle,
                startDate: formatDateToYYYYMMDD(cycle.startDate),
                endDate: formatDateToYYYYMMDD(cycle.endDate),
            };
            console.log(cycleWithFormattedDates);
            setTransformedCycle(cycleWithFormattedDates);
        } else if (isSuccess && !cycle) {
            // Si no se encontró el ciclo después de una carga exitosa, limpia el estado
            setTransformedCycle(null);
        }
    }, [isSuccess, cycle]);

    const [disabled, setDisabled] = useState(true)
    const toggleForm = () =>{
        setDisabled(!disabled);
    }
    return (
        <Grid container spacing={2}>
            <MyTitle>Ciclos</MyTitle>
            {isLoading ? (<CircularProgress/>):
            <CycleForm cycle={transformedCycle} disabled={disabled} action="edit" toggleForm={toggleForm}/>}
            <MyTitle>Etapas</MyTitle>
            <StageTable idCycle={parseInt(id)}/>
            <MyAlert
                message={message}
                severity={severity}
                open={open}
                onHandleClose={()=>dispatch(toggleAlert())}
            />
        </Grid>
    );
};
