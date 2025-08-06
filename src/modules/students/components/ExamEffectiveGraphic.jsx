import {Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis} from 'recharts';
import {CircularProgress, Grid, Paper} from "@mui/material";
import Typography from "@mui/material/Typography";
import {useGetExamEffectiveQuery} from "../../../store/slices/exam/examApiSlice.js";
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
                    {`Lectura: ${examenData.totalLectCorrect} - ${examenData.totalLectIncorrect}`}
                </Typography>
                <Typography variant="body2" color="warning.main">
                    {`Matemática: ${examenData.totalMateCorrect} - ${examenData.totalMateIncorrect}`}
                </Typography>
                <Typography variant="body2" color="success.main">
                    {`Total: ${examenData.totalMateCorrect + examenData.totalLectCorrect} - 
                    ${examenData.totalMateIncorrect + examenData.totalLectIncorrect}`}
                </Typography>
            </Paper>
        );
    }
    return null;
};

// Componente del gráfico
export const ExamEffectiveGraphic = () => {
    const {id:studentId} = useParams();
    const {id:cycleId} = useSelector(state => state.cycle.currentCycle)

    const  {data:examResult,isLoading} = useGetExamEffectiveQuery({studentId,cycleId});

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
            <BarChart
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
                <Bar
                    dataKey="totalLectCorrect"
                    fill="#002f6c"
                    name="Buenas Lect"
                    stackId="totalCorrect"
                />
                <Bar
                    dataKey="totalMateCorrect"
                    fill="#0059b3"
                    name="Buenas Mate"
                    stackId="totalCorrect"
                />
                <Bar
                    dataKey="totalLectIncorrect"
                    fill="#f7941d"
                    name="Malas Lect"
                    stackId="totalIncorrect"
                />
                <Bar
                    dataKey="totalMateIncorrect"
                    fill="#ed1c24"
                    name="Malas Mate"
                    stackId="totalIncorrect"
                />
            </BarChart>
        </ResponsiveContainer>
    );
};