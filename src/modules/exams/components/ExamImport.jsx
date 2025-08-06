import {Grid, styled} from "@mui/material";
import {MySelect, MyTitle} from "../../../components/ui/index.js";
import Button from '@mui/material/Button';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import {MyActionButtons} from "../../../components/ui/MyActionButtons.jsx";
import {useGetAreasQuery} from "../../../store/slices/api/apiSlice.js";

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

    const {data:areas} = useGetAreasQuery();
    return (
        <Grid width="100%" container spacing={2}>
            <Grid size={12}>
                <MyTitle>Importar resultados</MyTitle>
            </Grid>
            <Grid size={{xs:12}}>
                <MySelect
                    label="Área"
                    options={areas.filter(area => area.main)}
                    isForm={true}

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
