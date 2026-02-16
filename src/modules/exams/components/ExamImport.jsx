// ExamImport.jsx (Optimizado)

import { CircularProgress, Grid, styled } from "@mui/material";
import { MySelect, MyTitle } from "../../../components/ui/index.js";
import Button from '@mui/material/Button';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { MyActionButtons } from "../../../components/ui/MyActionButtons.jsx";
import { useGetAreasQuery } from "../../../store/slices/api/apiSlice.js";
import { toggleAlert } from "../../../store/slices/alert/alertSlice.js";
import { useState } from "react";
import { useImportExamMutation } from "../../../store/slices/exam/examApiSlice.js";
import { useDispatch, useSelector } from "react-redux";
import { MyAlert } from "../../../components/ui/MyAlert.jsx";
import Typography from "@mui/material/Typography";
import MyModal from "../../../components/ui/MyModal.jsx";
import {ImportConfirmation} from "../../../components/layout/ImportConfirmation.jsx";
import {useModal} from "../../../hooks/useModal.js";

const VisuallyHiddenInput = styled('input')({
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    height: 1,
    position: 'absolute',
    bottom: 0,
    left: 0,
    whiteSpace: 'nowrap',
    width: 1,
});

export const ExamImport = ({ onCloseForm }) => {

    const dispatch = useDispatch();
    const {open:openModal, toggleModal, title} = useModal({title: "Confirmación"});

    // Hooks de Redux
    const { data: areas, isLoading: isLoadingAreas } = useGetAreasQuery();
    const [uploadFile, { isLoading: isUploading }] = useImportExamMutation();
    const { message, severity, open } = useSelector(state => state.alert);
    const { id: examId } = useSelector(state => state.exam.selectedExam);

    // Reemplazo de react-hook-form con useState
    const [selectedFile, setSelectedFile] = useState(null);
    const [areaId, setAreaId] = useState(''); // Estado para el área, inicializado en ''

    const handleFileChange = (event) => {
        if (event.target.files && event.target.files.length > 0) {
            setSelectedFile(event.target.files[0]);
        }
    };

    const handleAreaChange = (event) => {
        setAreaId(event.target.value);
    };

    const onConfirmImport = () =>{
        console.log("Importado");
        if (!areaId) {
            console.log("Importado");
            dispatch(toggleAlert({ message: 'Por favor, seleccione un área', severity: 'warning' }));
            return;
        }
        if (!selectedFile) {
            console.log("Importado");
            dispatch(toggleAlert({ message: 'Por favor, seleccione un archivo', severity: 'warning' }));
            return;
        }
        toggleModal();
    }

    const handleConfirmAction = async () => {

        const formData = new FormData();
        formData.append("file", selectedFile);

        try {
            const selectedArea = areas.find(area => area.id === areaId);
            const areaName = selectedArea ? selectedArea.name.toUpperCase() : '';

            await uploadFile({ formData, examId, area: areaName }).unwrap();

            onCloseForm();
            dispatch(toggleAlert({ message: 'Examen importado correctamente', severity: 'success' }));
        } catch (err) {
            dispatch(toggleAlert({
                message: `Error ${err.status}: ${err.data?.message || 'Ha ocurrido un error inesperado'}`,
                severity: 'error'
            }));
        }
    };

    const handleCancelAction = () => {
        onCloseForm();
    };

    // Muestra un loader si las áreas o el archivo se están cargando
    if (isLoadingAreas || isUploading) {
        return <CircularProgress />;
    }

    return (
        <Grid width="100%" container spacing={2}>
            <Grid size={12}>
                <MyTitle>Importar resultados</MyTitle>
            </Grid>
            <Grid size={{xs: 12}}>
                <MySelect
                    value={areaId} // Controlado por el estado
                    onChange={handleAreaChange} // Manejador de cambio directo
                    options={areas?.filter(area => area.main) || []}
                    label="Área"
                    isForm
                />
            </Grid>
            <Grid size={3}>
                <Button
                    component="label"
                    role={undefined}
                    variant="contained"
                    tabIndex={-1}
                    startIcon={<CloudUploadIcon/>}
                >
                    Archivo
                    <VisuallyHiddenInput
                        type="file"
                        onChange={handleFileChange}
                        accept=".xlsx, .xls"
                    />
                </Button>
            </Grid>
            <Grid size={9}>
                <Typography noWrap>
                    {selectedFile ? selectedFile.name : "Ningún archivo seleccionado"}
                </Typography>
            </Grid>
            <MyActionButtons
                onConfirmAction={onConfirmImport}
                onCancelAction={handleCancelAction}
                confirmText="Importar"
                cancelText="Cancelar"
            />
            <MyModal
                open={openModal}
                toggleModal={toggleModal}
                title={title}
                content={
                    <ImportConfirmation
                    name={selectedFile?.name}
                    area={areas.find(area => area.id === areaId)?.name}
                    onCancelAction={toggleModal}
                    onConfirmAction={handleConfirmAction}
                    />
                }
            />
            <MyAlert
                message={message}
                severity={severity}
                open={open}
                onHandleClose={() => dispatch(toggleAlert())}
            />
        </Grid>
    );
};