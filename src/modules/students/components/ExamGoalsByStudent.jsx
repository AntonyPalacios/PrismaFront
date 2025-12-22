import {useParams} from "react-router";
import {useSelector} from "react-redux";
import {useGetExamGoalsByStudentQuery} from "../../../store/slices/exam/examApiSlice.js";
import {CircularProgress, Grid, Paper} from "@mui/material";
import Typography from "@mui/material/Typography";
import {
    Bar,
    CartesianGrid,
    ComposedChart,
    Legend,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from "recharts";

// Componente de Tooltip personalizado
const CustomTooltip = ({ active, payload, label, data }) => {
    if (active && payload && payload.length) {
        // Busca los datos completos del examen original usando la etiqueta (label)
        const examGoal = data.find(d => d.name === label);
        return (
            <Paper elevation={4} sx={{ p: 2, borderRadius: '8px' }}>
                <Typography variant="body2" color="text.primary" sx={{ fontWeight: 'bold' }}>
                    {label}
                </Typography>
                <Typography variant="body2" color="primary">
                    {`Puntaje: ${examGoal.score}`}
                </Typography>
                <Typography variant="body2" color="secondary">
                    {`Meta: ${examGoal.goal}`}
                </Typography>
                <Typography variant="body2" color="error.main">
                    {`Mérito: ${examGoal.merit}`}
                </Typography>
            </Paper>
        );
    }
    return null;
};

export const ExamGoalsByStudent = () => {

    const {id:studentId} = useParams();
    const {id:cycleId} = useSelector(state => state.cycle.currentCycle)

    const  {data:examGoals,isLoading} = useGetExamGoalsByStudentQuery({studentId,cycleId});

    // Handle loading state
    if (isLoading) {
        return (
            <Grid container justifyContent="center" alignItems="center" sx={{ height: 400 }}>
                <CircularProgress />
            </Grid>
        );
    }

    // Handle no data state
    if (!examGoals || examGoals.length === 0) {
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
            <ComposedChart
                data={examGoals}
                margin={{
                    top: 20,
                    right: 40,
                    left: 40,

                }}
            >
                <CartesianGrid strokeDasharray="2 2"/>
                <XAxis dataKey="name"/>
                <YAxis/>
                <Tooltip content={<CustomTooltip data={examGoals} />}/>
                <Legend/>
                <Bar
                    dataKey="score"
                    fill="#82ca9d"
                    name="Puntaje"
                />
                <Line
                    type="monotone"
                    dataKey="goal"
                    stroke="#8884d8"
                    name="Meta"
                />
            </ComposedChart>
            {/*<LineChart
                data={examGoals}
                margin={{
                    top: 20,
                    right: 40,
                    left: 40,

                }}
            >
                <CartesianGrid strokeDasharray="2 2"/>
                <XAxis dataKey="name"/>
                <YAxis/>
                <Tooltip content={<CustomTooltip data={examGoals} />}/>
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
            </LineChart>*/}
        </ResponsiveContainer>
    );
};
