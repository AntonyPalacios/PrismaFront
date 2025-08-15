import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend, ResponsiveContainer,
} from 'recharts';
import {CircularProgress, Grid, Paper} from "@mui/material";
import Typography from "@mui/material/Typography";
import {useGetExamResultQuery} from "../../../store/slices/exam/examApiSlice.js";
import {useParams} from "react-router";
import {useSelector} from "react-redux";


// Componente de Tooltip personalizado
const CustomTooltip = ({ active, payload, label, data }) => {
    if (active && payload && payload.length) {
        // Busca los datos completos del examen original usando la etiqueta (label)
        const examenData = data.find(d => d.name === label);
        return (
            <Paper elevation={4} sx={{ p: 2, borderRadius: '8px' }}>
                <Typography variant="body2" color="text.primary" sx={{ fontWeight: 'bold' }}>
                    {label}
                </Typography>
                <Typography variant="body2" color="primary">
                    {`Puntaje: ${examenData.score}`}
                </Typography>
                <Typography variant="body2" color="secondary">
                    {`Mérito: ${examenData.merit}`}
                </Typography>
                <Typography variant="body2" color="error.main">
                    {`Mínimo: ${examenData.min}`}
                </Typography>
                <Typography variant="body2" color="success.main">
                    {`Máximo: ${examenData.max}`}
                </Typography>
            </Paper>
        );
    }
    return null;
};

// Componente del gráfico
export const ExamGraphic = () => {
    const {id:studentId} = useParams();
    const {id:cycleId} = useSelector(state => state.cycle.currentCycle)

    const  {data:examResult,isLoading} = useGetExamResultQuery({studentId,cycleId});

    // Handle loading state
    if (isLoading) {
        return (
            <Grid container justifyContent="center" alignItems="center" sx={{ height: 400 }}>
                <CircularProgress />
            </Grid>
        );
    }

    // Handle no data state
    if (!examResult || examResult.length === 0) {
        return (
            <Grid container justifyContent="center" alignItems="center" sx={{ height: 400 }}>
                <Typography variant="h6" color="text.secondary">
                    No hay datos de exámenes disponibles para mostrar.
                </Typography>
            </Grid>
        );
    }


    return (
        <ResponsiveContainer width="100%" height={400}>
            <LineChart
                data={examResult}
                margin={{
                    top: 20,
                    right: 40,
                    left: 40,

                }}
            >
                <CartesianGrid strokeDasharray="2 2"/>
                <XAxis dataKey="name"/>
                <YAxis/>
                <Tooltip content={<CustomTooltip data={examResult} />}/>
                <Legend/>
                <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#8884d8"
                    activeDot={{r: 8}}
                    name="Puntaje"
                />
                <Line
                    type="monotone"
                    dataKey="min"
                    stroke="#82ca9d"
                    name="Puntaje Mínimo"
                />
                <Line
                    type="monotone"
                    dataKey="max"
                    stroke="#ffc658"
                    name="Puntaje Máximo"
                />
            </LineChart>
        </ResponsiveContainer>
    );
};