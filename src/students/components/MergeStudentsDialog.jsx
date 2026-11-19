import { useState } from 'react';
import { useNavigate } from 'react-router';
import Alert from '@mui/material/Alert';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { formatDate } from '../../academic/cycleDisplay';
import { errorDetail } from '../../app/api/errors';
import { useNotify } from '../../app/notifyContext';
import ConfirmDialog from '../../layout/ConfirmDialog';
import ResponsiveSheet from '../../layout/ResponsiveSheet';
import { useGetMergePreviewQuery, useGetStudentsQuery, useMergeStudentsMutation } from '../api/studentsApi';
import { studentFullName } from '../studentDisplay';

const cell = { px: 1.25, py: 0.75, fontSize: 13, borderBottom: '1px solid #EEF1F5', textAlign: 'left', verticalAlign: 'top' };
const head = { ...cell, fontSize: 12, fontWeight: 500, color: 'text.secondary' };
const optionLabel = (s) => `${studentFullName(s)} · ${s.dni ? `DNI ${s.dni}` : 'Sin DNI'}${s.active ? '' : ' · Dado de baja'}`;
const orDash = (value) => value ?? '—';

/**
 * "Fusionar con otro alumno" (agreements of 2026-11-18), ADMIN only: find
 * the duplicate of {@code student}, see both side by side with what
 * collides, choose which one stays and merge. Everything of the other
 * moves to the one that stays and the other is deleted for good.
 */
export default function MergeStudentsDialog({ student, onClose }) {
  const notify = useNotify();
  const navigate = useNavigate();
  const { data: students = [] } = useGetStudentsQuery({ includeInactive: true });
  const [other, setOther] = useState(null);
  // the id that stays: this student, unless the admin picks the other
  const [keepId, setKeepId] = useState(student.id);
  const [confirming, setConfirming] = useState(false);
  const removeId = other ? (keepId === student.id ? other.id : student.id) : null;
  const {
    currentData: preview,
    isFetching,
    error,
  } = useGetMergePreviewQuery({ keepId, removeId }, { skip: !other });
  const [mergeStudents, { isLoading: merging, error: mergeError }] = useMergeStudentsMutation();

  const merge = async () => {
    try {
      await mergeStudents({ keepId, removeId }).unwrap();
      notify('Alumnos fusionados.');
      onClose();
      navigate(`/students/${keepId}`, { replace: true });
    } catch {
      setConfirming(false); // the alert shows why
    }
  };

  const rows = preview && [
    ['DNI', preview.keep.data.dni, preview.remove.data.dni, preview.merged.dni],
    ['Correo', preview.keep.data.email, preview.remove.data.email, preview.merged.email],
    ['Teléfono', preview.keep.data.phone, preview.remove.data.phone, preview.merged.phone],
    [
      'Nacimiento',
      preview.keep.data.birthDate && formatDate(preview.keep.data.birthDate),
      preview.remove.data.birthDate && formatDate(preview.remove.data.birthDate),
      preview.merged.birthDate && formatDate(preview.merged.birthDate),
    ],
    ['Matrículas', preview.keep.enrollments, preview.remove.enrollments],
    ['Resultados', preview.keep.results, preview.remove.results],
    ['Metas', preview.keep.goals, preview.remove.goals],
    ['Bitácora', preview.keep.logEntries, preview.remove.logEntries],
    ['Apoderados', preview.keep.parents, preview.remove.parents],
  ];

  return (
    <ResponsiveSheet onClose={onClose} maxWidth="md">
      <Box
        component="section"
        aria-label="Fusionar alumnos"
        sx={{ display: 'flex', flexDirection: 'column', gap: 1.75, p: { xs: '12px 20px 24px', md: 3 }, overflowY: 'auto' }}
      >
        <Box>
          <Typography component="h2" sx={{ fontSize: 20, fontWeight: 500 }}>
            Fusionar alumnos
          </Typography>
          <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
            Junta dos fichas del mismo alumno: todo lo del que se elimina pasa al que se queda.
          </Typography>
        </Box>

        <Autocomplete
          options={students.filter((s) => s.id !== student.id)}
          value={other}
          onChange={(_, chosen) => {
            setOther(chosen);
            setKeepId(student.id);
          }}
          getOptionLabel={optionLabel}
          isOptionEqualToValue={(a, b) => a.id === b.id}
          noOptionsText="No hay alumnos que coincidan."
          renderInput={(params) => (
            <TextField
              {...params}
              label="Alumno duplicado"
              placeholder="Busca por apellido, nombre o DNI"
              slotProps={{ ...params.slotProps, inputLabel: { shrink: true } }}
            />
          )}
        />

        {other && (
          <RadioGroup value={String(keepId)} onChange={(e) => setKeepId(Number(e.target.value))} aria-label="Quedarse con">
            <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>Quedarse con</Typography>
            {[student, other].map((s) => (
              <FormControlLabel key={s.id} value={String(s.id)} control={<Radio />} label={optionLabel(s)} />
            ))}
          </RadioGroup>
        )}

        {isFetching && !preview && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
            <CircularProgress size={24} aria-label="Cargando vista previa" />
          </Box>
        )}
        {error && <Alert severity="error">{errorDetail(error)}</Alert>}

        {preview && (
          <>
            <Box sx={{ overflowX: 'auto', border: 1, borderColor: 'divider', borderRadius: '12px' }}>
              <Box component="table" aria-label="Vista previa de la fusión" sx={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <Box component="th" sx={head} />
                    <Box component="th" sx={head}>{`Se queda: ${preview.keep.fullName}`}</Box>
                    <Box component="th" sx={head}>{`Se elimina: ${preview.remove.fullName}`}</Box>
                    <Box component="th" sx={head}>Quedará</Box>
                  </tr>
                </thead>
                <tbody>
                  {rows.map(([label, mine, theirs, result]) => (
                    <tr key={label}>
                      <Box component="th" scope="row" sx={{ ...cell, fontWeight: 500 }}>
                        {label}
                      </Box>
                      <Box component="td" sx={cell}>{orDash(mine)}</Box>
                      <Box component="td" sx={cell}>{orDash(theirs)}</Box>
                      <Box component="td" sx={cell}>
                        {result === undefined ? (typeof mine === 'number' ? 'Se juntan' : '') : orDash(result)}
                      </Box>
                    </tr>
                  ))}
                </tbody>
              </Box>
            </Box>

            {(preview.sharedStages.length > 0 || preview.resultConflicts > 0 || preview.goalConflicts > 0) && (
              <Alert severity="info">
                <Box component="ul" sx={{ m: 0, pl: 2 }}>
                  {preview.sharedStages.map((stage) => (
                    <li key={stage.stageLabel}>
                      {`Los dos están matriculados en ${stage.stageLabel}: queda la matrícula de quien se queda` +
                        (stage.keepTutorName ? `, con su tutor ${stage.keepTutorName}` : ', sin tutor') +
                        (stage.removeTutorName ? `; se descarta ${stage.removeTutorName}.` : '.')}
                    </li>
                  ))}
                  {preview.resultConflicts > 0 && (
                    <li>{`${preview.resultConflicts} ${preview.resultConflicts === 1 ? 'examen tiene' : 'exámenes tienen'} resultado de los dos: se queda el mejor.`}</li>
                  )}
                  {preview.goalConflicts > 0 && (
                    <li>{`${preview.goalConflicts} ${preview.goalConflicts === 1 ? 'meta repetida' : 'metas repetidas'}: se quedan las de quien se queda.`}</li>
                  )}
                </Box>
              </Alert>
            )}
          </>
        )}

        {mergeError && <Alert severity="error">{errorDetail(mergeError)}</Alert>}

        <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'flex-end', pt: 1 }}>
          <Button variant="outlined" onClick={onClose} sx={{ minWidth: 120, height: 44 }}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            color="error"
            disabled={!preview || merging}
            onClick={() => setConfirming(true)}
            sx={{ minWidth: 120, height: 44 }}
          >
            Fusionar
          </Button>
        </Box>
      </Box>

      {confirming && preview && (
        <ConfirmDialog
          title="¿Fusionar alumnos?"
          message={
            `${preview.remove.fullName} se eliminará definitivamente y todo lo suyo pasará a ${preview.keep.fullName}. ` +
            'Esta acción no se puede deshacer.'
          }
          confirmLabel="Fusionar"
          danger
          loading={merging}
          onConfirm={merge}
          onCancel={() => setConfirming(false)}
        />
      )}
    </ResponsiveSheet>
  );
}
