import { useState } from 'react';
import { useNavigate } from 'react-router';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useGetCyclesQuery } from '../../academic/api/cyclesApi';
import { useGetStagesQuery } from '../../academic/api/stagesApi';
import { errorDetail } from '../../app/api/errors';
import ResponsiveSheet from '../../layout/ResponsiveSheet';
import { TEMPLATE_URL, useUploadStudentsMutation } from '../api/importsApi';

const selectProps = { select: true, fullWidth: true, slotProps: { select: { native: true }, inputLabel: { shrink: true } } };

/**
 * "Importar alumnos": the filled template and, optionally, the stage where
 * the students will be enrolled (by default the stage in force of the
 * active cycle; "No matricular" only registers them). Uploading creates a
 * pending batch and opens its review: nothing is saved yet.
 */
export default function ImportStudentsForm({ onClose }) {
  return (
    <ResponsiveSheet onClose={onClose}>
      <ImportStudentsFormContent onClose={onClose} />
    </ResponsiveSheet>
  );
}

function ImportStudentsFormContent({ onClose }) {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [serverError, setServerError] = useState(null);
  const [upload, { isLoading }] = useUploadStudentsMutation();
  const { data: cycles = [] } = useGetCyclesQuery();
  const openCycles = cycles.filter((c) => c.status !== 'CLOSED');
  // null = the default (the active cycle), '' = do not enroll
  const [chosenCycleId, setChosenCycleId] = useState(null);
  const [chosenStageId, setChosenStageId] = useState(null);

  const defaultCycle = openCycles.find((c) => c.status === 'ACTIVE') ?? openCycles[0];
  const cycleId = chosenCycleId === null ? defaultCycle?.id ?? '' : chosenCycleId;
  const { data: stages = [] } = useGetStagesQuery(cycleId, { skip: !cycleId });
  const stageId = chosenStageId ?? stages.find((s) => s.current)?.id ?? stages[stages.length - 1]?.id ?? '';

  const submit = async (event) => {
    event.preventDefault();
    setServerError(null);
    try {
      const batch = await upload({ file, stageId: cycleId ? stageId : null }).unwrap();
      onClose();
      navigate(`/imports/${batch.id}`);
    } catch (error) {
      setServerError(errorDetail(error)); // e.g. invalid rows: fix the spreadsheet and upload again
    }
  };

  return (
    <Box
      component="form"
      noValidate
      onSubmit={submit}
      aria-label="Importar alumnos"
      sx={{ display: 'flex', flexDirection: 'column', gap: 1.75, p: { xs: '12px 20px 24px', md: 3 }, overflowY: 'auto' }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        <Typography component="h2" sx={{ fontSize: 18, fontWeight: 500 }}>
          Importar alumnos
        </Typography>
        <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
          Llena la plantilla sin cambiar el orden de sus columnas. Antes de guardar nada podrás revisar cada fila.{' '}
          <Link href={TEMPLATE_URL} download>
            Descargar plantilla
          </Link>
        </Typography>
      </Box>

      <Button variant="outlined" component="label" sx={{ height: 48, justifyContent: 'flex-start' }}>
        {file ? file.name : 'Elegir archivo (.xlsx)'}
        <input
          hidden
          type="file"
          accept=".xlsx"
          aria-label="Archivo de alumnos"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
      </Button>

      <TextField
        {...selectProps}
        label="Matricular en el ciclo"
        value={cycleId}
        onChange={(e) => {
          setChosenCycleId(e.target.value === '' ? '' : Number(e.target.value));
          setChosenStageId(null);
        }}
      >
        <option value="">No matricular (solo registrar)</option>
        {openCycles.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </TextField>
      {cycleId !== '' && (
        <TextField
          {...selectProps}
          label="Etapa"
          value={stageId}
          onChange={(e) => setChosenStageId(Number(e.target.value))}
          helperText="Al confirmar, los alumnos se matriculan aquí con la carrera y el tutor de su fila."
        >
          {stages.map((s) => (
            <option key={s.id} value={s.id}>
              {s.current ? `${s.name} (vigente)` : s.name}
            </option>
          ))}
        </TextField>
      )}

      {serverError && <Alert severity="error">{serverError}</Alert>}

      <Box sx={{ display: 'flex', gap: 1, pt: 0.5 }}>
        <Button variant="outlined" onClick={onClose} disabled={isLoading} sx={{ flex: 1, height: 48 }}>
          Cancelar
        </Button>
        <Button type="submit" variant="contained" color="secondary" disabled={!file || isLoading} sx={{ flex: 1, height: 48 }}>
          Subir y revisar
        </Button>
      </Box>
    </Box>
  );
}
