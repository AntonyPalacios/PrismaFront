import {CircularProgress, Grid, styled} from "@mui/material";
import Typography from "@mui/material/Typography";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import Button from "@mui/material/Button";
import {useState} from "react";
import {MyActionButtons} from "../../../components/ui/MyActionButtons.jsx";
import {useImportStudentsMutation} from "../../../store/slices/student/studentsApiSlice.js";
import {useDispatch, useSelector} from "react-redux";
import {toggleAlert} from "../../../store/slices/alert/alertSlice.js";
import {MyAlert} from "../../../components/ui/MyAlert.jsx";

export const StudentImport = ({onCloseForm}) => {
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

    const {message, severity, open} = useSelector(state => state.alert);
    const {name} = useSelector(state => state.cycle.currentStage);

    const dispatch = useDispatch();

    const [uploadFile, {isLoading}] = useImportStudentsMutation();

    const [selectedFile, setSelectedFile] = useState(null)
    const handleChange = (event) => {
        setSelectedFile(event.target.files[0]);
    }

    const handleConfirmAction = async () => {
        if (selectedFile) {
            const formData = new FormData();
            formData.append("file", selectedFile);

            try {
                await uploadFile(formData).unwrap();
                onCloseForm()
                dispatch(toggleAlert({message: 'Alumnos importados correctamente', severity: 'success'}));
            } catch (err) {
                dispatch(toggleAlert({
                    message: `Error ${err.status}: ${err.message || 'Ha ocurrido un error inesperado'}`,
                    severity: 'error'
                }))
            }
        } else {
            dispatch(toggleAlert({
                message: 'Por favor, seleccione un archivo',
                severity: 'error'
            }))
            setSelectedFile(null)
        }
    }

    const handleCancelAction = () => {
        onCloseForm();
    }

    return (
        <>
            {isLoading ? (<CircularProgress/>) :
                <Grid container spacing={2} width="100%">

                    <Grid size={12}>
                        <Typography variant="body2" color="textPrimary" component="div">
                            La lista de alumnos será cargada a la etapa actual: {name}
                        </Typography>
                    </Grid>
                    <Grid size={4}>
                        <Button
                            component="label"
                            sx={{padding: "10px"}}
                            variant="contained"
                        >
                            <Grid container spacing={2}
                                  sx={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
                                <Grid size={2}>
                                    <CloudUploadIcon/>
                                </Grid>
                                <Grid size={9}>
                                    <Typography variant="body2" color="white" component="p">
                                        Subir archivo
                                    </Typography>
                                    <VisuallyHiddenInput
                                        type="file"
                                        onChange={handleChange}
                                        accept=".xls, .xlsx"
                                    />
                                </Grid>
                            </Grid>
                        </Button>
                    </Grid>
                    <Grid size={8} sx={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
                        <Typography variant="body2" color="textPrimary"
                                    component="div">{selectedFile?.name || "Por favor, seleccione un archivo"}</Typography>
                    </Grid>
                    <MyActionButtons onConfirmAction={handleConfirmAction}
                                     onCancelAction={handleCancelAction}
                                     confirmText={"Importar"}
                                     cancelText={"Cancelar"}/>
                    <MyAlert
                        message={message}
                        severity={severity}
                        open={open}
                        onHandleClose={() => dispatch(toggleAlert())}
                    />
                </Grid>}
        </>
    );
};
