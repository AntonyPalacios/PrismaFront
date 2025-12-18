import React, {useState} from 'react';
import {
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

const options = [{id: 1, name: "Ciencias"}, {id: 2, name: "Letras"}, {id: 3, name: "Arquitectura"},]

export const SummaryTable = () => {


    const renderRow = (exam, sectionData, type) => {
        if (exam.id === sectionData.examId) return (
            <React.Fragment key={exam.id}>
                <TableCell sx={{border: '1px solid black'}}>{sectionData[`${type}Correct`]}</TableCell>
                <TableCell sx={{border: '1px solid black'}}>{sectionData[`${type}Incorrect`]}</TableCell>
            </React.Fragment>)
    }

    const renderData = (examData, data, section) => {
        /* primero debe armar el ROW de 3 con lectura y llenar los datos de mínimo con table cell
        luego debe crear otro row con los datos de máximo
        finalmente debe crear otro row con los datos de promedio
        */
        return (
            <React.Fragment>
                <TableRow>
                    <TableCell rowSpan={3} sx={{
                        backgroundColor: 'secondary.main',
                        color: 'white',
                        borderRight: '1px solid #e0e0e0',
                        width: "auto"
                    }}>
                        <Typography variant="subtitle1"
                                    sx={{whiteSpace: 'nowrap', textAlign: 'center'}}>
                            {section}
                        </Typography>

                    </TableCell>
                    <TableCell sx={{
                        backgroundColor: 'secondary.main',
                        color: 'white',
                        borderRight: '1px solid #e0e0e0',
                        width: "auto"
                    }}>
                        <Typography variant="subtitle1"
                                    sx={{whiteSpace: 'nowrap', textAlign: 'center'}}>
                            Mínimo
                        </Typography>
                    </TableCell>
                    {
                        examData.flatMap(exam =>
                            data.map((sectionData) => renderRow(exam, sectionData, "min"))
                        )
                    }

                </TableRow>
                <TableRow>
                    <TableCell sx={{
                        backgroundColor: 'secondary.main',
                        color: 'white',
                        borderRight: '1px solid #e0e0e0',
                        width: "auto"
                    }}>
                        <Typography variant="subtitle1"
                                    sx={{whiteSpace: 'nowrap', textAlign: 'center'}}>
                            Máximo
                        </Typography>
                    </TableCell>
                    {
                        examData.flatMap(exam =>
                            data.map((sectionData) => renderRow(exam, sectionData, "max"))
                        )
                    }
                </TableRow>
                <TableRow>
                    <TableCell sx={{
                        backgroundColor: 'secondary.main',
                        color: 'white',
                        borderRight: '1px solid #e0e0e0',
                        width: "auto"
                    }}>
                        <Typography variant="subtitle1"
                                    sx={{whiteSpace: 'nowrap', textAlign: 'center'}}>
                            Promedio
                        </Typography>
                    </TableCell>
                    {
                        examData.flatMap(exam =>
                            data.map((sectionData) => renderRow(exam, sectionData, "avg"))
                        )
                    }
                </TableRow>
            </React.Fragment>
        )
    }

    const [areaId, setAreaId] = useState(-1);

    const handleAreaId = (event) => {
        setAreaId(event.target.value);
    }

    const {id: userId} = useParams();
    const {id: cycleId} = useSelector(state => state.cycle.currentCycle)

    const {data, isLoading} = useGetExamResultsByUserQuery({areaId, userId, cycleId})


    return (<Grid container spacing={2}>
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
        {isLoading ? (<CircularProgress color="secondary"/>) : <Grid size={12}>
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
                                </TableCell>))}
                        </TableRow>

                        <TableRow>

                            {data.examData.map((header) => (<React.Fragment key={header.id}>
                                <TableCell align="center"
                                           sx={{
                                               backgroundColor: 'success.main', color: 'white',
                                           }}>Buenas</TableCell>
                                <TableCell align="center" sx={{
                                    backgroundColor: 'error.main',
                                    color: 'white',
                                    borderRight: '1px solid #e0e0e0'
                                }}>Malas</TableCell>
                            </React.Fragment>))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {renderData(data.examData, data.lectData, "LECT")}

                        {renderData(data.examData, data.mateData, "MATE")}

                    </TableBody>
                </Table>
            </TableContainer>
        </Grid>}
    </Grid>);
};
