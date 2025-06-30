import {Grid, styled} from "@mui/material";
import {MySelect, MyTitle} from "../../../components/ui/index.js";
import {areas} from "../../../assets/fakeData.jsx";
import Button from '@mui/material/Button';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import {MyActionButtons} from "../../../components/ui/MyActionButtons.jsx";

export const ExamImport = () => {
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
    return (
        <Grid width="100%" container spacing={2}>
            <Grid size={12}>
                <MyTitle>Importar resultados</MyTitle>
            </Grid>
            <Grid size={{xs:12}}>
                <MySelect
                    label="Área"
                    options={areas}

                />
            </Grid>
            <Grid size={12}>
                <Button
                    component="label"
                    role={undefined}
                    variant="contained"
                    tabIndex={-1}
                    startIcon={<CloudUploadIcon />}
                >
                    Archivo
                    <VisuallyHiddenInput
                        type="file"
                        onChange={(event) => console.log(event.target.files)}
                        multiple
                    />
                </Button>
            </Grid>
            <MyActionButtons/>

        </Grid>
    );
};
