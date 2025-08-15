import React, {useState} from 'react';
import {
    Box,
    CircularProgress,
    Grid,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography
} from '@mui/material';
import {MySelect, MyTitle} from "../../../components/ui/index.js";
import {useParams} from "react-router";
import {useSelector} from "react-redux";
import {useGetExamResultsByUserQuery} from "../../../store/slices/exam/examApiSlice.js";

/*const data = {
    examData: [
        {
            id: 1,
            name: "Examen 1",
            date: "21/07/2025"
        },
        {
            id: 2,
            name: "Examen 2",
            date: "29/07/2025"
        }
    ],
    lectData: [
        {
            indicator: "Min",
            results: [
                {
                    examId: 1,
                    correct: 14,
                    incorrect: 8
                },
                {
                    examId: 2,
                    correct: 14,
                    incorrect: 8
                }
            ]
        },
        {
            indicator: "Max",
            results: [
                {
                    examId: 1,
                    correct: 16,
                    incorrect: 14
                },
                {
                    examId: 2,
                    correct: 16,
                    incorrect: 14
                }
            ]
        },
        {
            indicator: "Avg",
            results: [
                {
                    examId: 1,
                    correct: 15,
                    incorrect: 11
                },
                {
                    examId: 2,
                    correct: 15,
                    incorrect: 11
                }
            ]
        }
    ],
    mateData: [
        {
            indicator: "Min",
            results: [
                {
                    examId: 1,
                    correct: 10,
                    incorrect: 19
                },
                {
                    examId: 2,
                    correct: 10,
                    incorrect: 19
                }
            ]
        },
        {
            indicator: "Max",
            results: [
                {
                    examId: 1,
                    correct: 29,
                    incorrect: 20
                },
                {
                    examId: 2,
                    correct: 29,
                    incorrect: 20
                }
            ]
        },
        {
            indicator: "Avg",
            results: [
                {
                    examId: 1,
                    correct: 19,
                    incorrect: 19
                },
                {
                    examId: 2,
                    correct: 19,
                    incorrect: 19
                }
            ]
        }
    ]
}*/

const options = [
    {id: 1, name: "Ciencias"},
    {id: 2, name: "Letras"},
    {id: 3, name: "Arquitectura"},
]
const setIndicatorName = (indicator) => {
    switch (indicator) {
        case "Min":
            return "Mínimo";
        case "Max":
            return "Máximo"
        case "Avg":
            return "Promedio";
        default:
            return indicator;
    }
}
export const SummaryTable = () => {
    const renderTableRows = (examData, data) => (
        <React.Fragment>
            {data.map((result, index) => (
                <TableRow key={index}>

                    <TableCell
                        sx={{backgroundColor: 'secondary.main', color: 'white', borderRight: '1px solid #e0e0e0', width:"auto"}}>
                        {setIndicatorName(result.indicator)}
                    </TableCell>

                    {examData.map((header) => (
                        <React.Fragment key={header.id}>
                            <TableCell>{result.results.filter(r => r.examId === header.id)[0].correct}</TableCell>
                            <TableCell>{result.results.filter(r => r.examId === header.id)[0].incorrect}</TableCell>
                        </React.Fragment>
                    ))}
                </TableRow>
            ))}
        </React.Fragment>
    );
    const [areaId, setAreaId] = useState(-1);

    const handleAreaId = (event) => {
        setAreaId(event.target.value);
    }

    const {id: userId} = useParams();
    const {id: cycleId} = useSelector(state => state.cycle.currentCycle)

    const {data, isLoading} = useGetExamResultsByUserQuery({areaId, userId, cycleId})


    return (
        <Grid container spacing={2}>
            <Grid size={12}>
                <MyTitle>Datos Salón</MyTitle>
            </Grid>
            <Grid size={{xs: 6, md: 3}}>
                <MySelect
                    label="Area"
                    options={options}
                    value={areaId}
                    onChange={handleAreaId}
                    defaultItem="Todas las áreas"
                    isForm={false}
                />
            </Grid>
            {isLoading ? (<CircularProgress color="secondary"/>) :
                <Grid size={12}>
                    <TableContainer component={Paper} sx={{margin: '20px', width: 'auto'}}>
                        <Table sx={{minWidth: 650}} aria-label="custom table">
                            <TableHead>

                                <TableRow>

                                    <TableCell rowSpan={2} sx={{
                                        backgroundColor: 'secondary.main',
                                        color: 'white',
                                        borderRight: '1px solid #e0e0e0',
                                        width: "50px"

                                    }}/>
                                    <TableCell rowSpan={2} sx={{
                                        backgroundColor: 'secondary.main',
                                        color: 'white',
                                        borderRight: '1px solid #e0e0e0',
                                        width: "50px"

                                    }}/>

                                    {data.examData.map((header) => (
                                        <TableCell key={header.id} colSpan={2} align="center" sx={{
                                            backgroundColor: 'secondary.main',
                                            color: 'white',
                                            borderRight: '1px solid #e0e0e0'
                                        }}>
                                            {header.date} <br/> {header.name}
                                        </TableCell>
                                    ))}
                                </TableRow>

                                <TableRow>

                                    {data.examData.map((header) => (
                                        <React.Fragment key={header.id}>
                                            <TableCell align="center"
                                                       sx={{
                                                           backgroundColor: 'success.main',
                                                           color: 'white',
                                                       }}>Buenas</TableCell>
                                            <TableCell align="center" sx={{
                                                backgroundColor: 'error.main',
                                                color: 'white',
                                                borderRight: '1px solid #e0e0e0'
                                            }}>Malas</TableCell>
                                        </React.Fragment>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>

                                <TableRow>

                                    <TableCell rowSpan={data.lectData.length + 1} sx={{
                                        backgroundColor: 'secondary.main',
                                        color: 'white',
                                        borderRight: '1px solid #e0e0e0',
                                        width: "auto"
                                    }}>
                                        <Typography variant="subtitle1"
                                                    sx={{whiteSpace: 'nowrap', textAlign: 'center'}}>
                                            LECT
                                        </Typography>

                                    </TableCell>
                                </TableRow>

                                {renderTableRows(data.examData, data.lectData)}


                                <TableRow>

                                    <TableCell rowSpan={data.mateData.length + 1} sx={{
                                        backgroundColor: 'secondary.main',
                                        color: 'white',
                                        borderRight: '1px solid #e0e0e0',
                                        width: "auto"
                                    }}>
                                        <Typography variant="subtitle1"
                                                    sx={{whiteSpace: 'nowrap', textAlign: 'center'}}>
                                            MATE
                                        </Typography>

                                    </TableCell>
                                </TableRow>

                                {renderTableRows(data.examData, data.mateData)}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Grid>}
        </Grid>
    );
};
