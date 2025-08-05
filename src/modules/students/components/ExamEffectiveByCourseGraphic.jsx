import {Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis} from 'recharts';
import {CircularProgress, Grid, Paper} from "@mui/material";
import Typography from "@mui/material/Typography";
import {useGetExamEffectiveByCourseQuery} from "../../../store/slices/exam/examApiSlice.js";
import {useParams} from "react-router";
import {useSelector} from "react-redux";


// Componente de Tooltip personalizado
const CustomTooltip = ({active, payload, label, data}) => {
    if (active && payload && payload.length) {
        // Busca los datos completos del examen original usando la etiqueta (label)
        const examenData = data.find(d => d.name === label);
        return (
            <Paper elevation={4} sx={{p: 2, borderRadius: '8px'}}>
                <Typography variant="body2" color="text.primary" sx={{fontWeight: 'bold'}}>
                    {label}
                </Typography>
                <Typography variant="body2" color="primary">
                    {`Lectura: ${examenData.lectCorrect} - ${examenData.lectIncorrect}`}
                </Typography>
                <Typography variant="body2" color="secondary.main">
                    {`NyO: ${examenData.nyoCorrect} - ${examenData.nyoIncorrect}`}
                </Typography>
                <Typography variant="body2" color="warning.main">
                    {`X: ${examenData.xCorrect} - ${examenData.xIncorrect}`}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    {`Geo: ${examenData.geoCorrect} - ${examenData.geoIncorrect}`}
                </Typography>
                <Typography variant="body2" color="success.main">
                    {`Trigo: ${examenData.trigoCorrect} - ${examenData.trigoIncorrect}`}
                </Typography>
                <Typography variant="body2" color="error.main">
                    {`Est: ${examenData.estCorrect} - ${examenData.estIncorrect}`}
                </Typography>
            </Paper>
        );
    }
    return null;
};

// Componente del gráfico
export const ExamEffectiveByCourseGraphic = () => {
    const {id: studentId} = useParams();
    const {id: cycleId} = useSelector(state => state.cycle.currentCycle)

    const {data: examResult, isLoading} = useGetExamEffectiveByCourseQuery({studentId, cycleId});

    // Handle loading state
    if (isLoading) {
        return (
            <Grid container justifyContent="center" alignItems="center" sx={{height: 400}}>
                <CircularProgress/>
            </Grid>
        );
    }

    // Handle no data state
    if (!examResult || examResult.length === 0) {
        return (
            <Grid container justifyContent="center" alignItems="center" sx={{height: 400}}>
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
                <Tooltip content={<CustomTooltip data={examResult}/>}/>

                <Bar
                    dataKey="lectCorrect"
                    fill="#002f6c"
                    stackId="totalCorrect"
                />
                <Bar
                    dataKey="nyoCorrect"
                    fill="#0059b3"
                    stackId="totalCorrect"
                />
                <Bar
                    dataKey="xCorrect"
                    fill="#F7941D"
                    stackId="totalCorrect"
                />
                <Bar
                    dataKey="geoCorrect"
                    fill="#d6d6d6"
                    stackId="totalCorrect"
                />
                <Bar
                    dataKey="trigoCorrect"
                    fill="#8dc63f"
                    stackId="totalCorrect"
                />
                <Bar
                    dataKey="estCorrect"
                    fill="#ec008c"
                    stackId="totalCorrect"
                />

                <Bar
                    dataKey="lectIncorrect"
                    fill="#002f6c"
                    stackId="totalIncorrect"
                />
                <Bar
                    dataKey="nyoIncorrect"
                    fill="#0059b3"
                    stackId="totalIncorrect"
                />
                <Bar
                    dataKey="xIncorrect"
                    fill="#F7941D"
                    stackId="totalIncorrect"
                />
                <Bar
                    dataKey="geoIncorrect"
                    fill="#d6d6d6"
                    stackId="totalIncorrect"
                />
                <Bar
                    dataKey="trigoIncorrect"
                    fill="#8dc63f"
                    stackId="totalIncorrect"
                />
                <Bar
                    dataKey="estIncorrect"
                    fill="#ec008c"
                    stackId="totalIncorrect"
                />
            </BarChart>
        </ResponsiveContainer>
    );
};