import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { errorDetail } from '../../app/api/errors';
import { useNotify } from '../../app/notifyContext';
import ResponsiveSheet from '../../layout/ResponsiveSheet';
import { useResolveImportRowMutation, useSearchImportStudentsQuery } from '../api/importsApi';
import { splitName, titleCase } from '../importDisplay';

const SEARCH_DELAY_MS = 300;

// the same limits as registering a student by hand
const newStudentSchema = z.object({
  lastNamePat: z.string().trim().min(1, 'Ingresa el apellido paterno del alumno.').max(100, 'El apellido paterno es demasiado largo.'),
  lastNameMat: z.string().trim().max(100, 'El apellido materno es demasiado largo.'),
  firstName: z.string().trim().min(1, 'Ingresa los nombres del alumno.').max(150, 'Los nombres son demasiado largos.'),
});

/** The row's choice as one value: 'student:<id>', 'new' or 'ignore' ('' = not decided). */
function currentChoice(row) {
  if (row.status === 'IGNORED') return 'ignore';
  if (row.status === 'NEW_STUDENT') return 'new';
  if (row.student && row.status !== 'UNRESOLVED') return `student:${row.student.id}`;
  return '';
}

/** The names a new student from a results row starts with: the ones saved, or the file's cell split. */
function newStudentDefaults(row) {
  if (row.newStudent) return { ...row.newStudent, lastNameMat: row.newStudent.lastNameMat ?? '' };
  return splitName(titleCase(row.fullName));
}

/**
 * "Fila N" (Claude Design: RowResolutionMobile): the row as read, and what
 * it is — one of the suggested students, another one found by name or DNI,
 * a new student, or ignored. Saved with "Guardar resolución". A results
 * row (`results`) shows its scores, and a new student needs its last names
 * and first names split by hand (the file has them in one cell).
 */
export default function RowResolution({ batchId, row, results = false, editable, onClose }) {
  return (
    <ResponsiveSheet onClose={onClose}>
      <RowResolutionContent batchId={batchId} row={row} results={results} editable={editable} onClose={onClose} />
    </ResponsiveSheet>
  );
}

function RowResolutionContent({ batchId, row, results, editable, onClose }) {
  const notify = useNotify();
  const [choice, setChoice] = useState(currentChoice(row));
  const [serverError, setServerError] = useState(null);
  const [typed, setTyped] = useState('');
  const [query, setQuery] = useState('');
  const [resolve, { isLoading }] = useResolveImportRowMutation();
  const searching = query.length >= 2;
  const { currentData } = useSearchImportStudentsQuery({ batchId, query }, { skip: !searching });
  // only the results of what is typed now: clearing the box clears them
  const found = searching ? currentData ?? [] : [];
  // a student picked from the search stays listed after the search changes
  const [picked, setPicked] = useState(null);
  const splittingNames = results && choice === 'new';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(newStudentSchema), defaultValues: newStudentDefaults(row) });

  useEffect(() => {
    const timer = setTimeout(() => setQuery(typed.trim()), SEARCH_DELAY_MS);
    return () => clearTimeout(timer);
  }, [typed]);

  // the suggested students, the one already chosen and those found, once each
  const options = [...(row.student ? [row.student] : []), ...row.candidates, ...(picked ? [picked] : []), ...found].filter(
    (student, index, all) => all.findIndex((s) => s.id === student.id) === index,
  );

  const send = async (newStudent) => {
    setServerError(null);
    const [action, id] = choice === 'new' ? ['NEW'] : choice === 'ignore' ? ['IGNORE'] : ['MATCH', Number(choice.split(':')[1])];
    try {
      await resolve({ batchId, rowId: row.id, action, studentId: id ?? null, newStudent }).unwrap();
      notify(`Fila ${row.rowNumber} resuelta.`);
      onClose();
    } catch (error) {
      setServerError(errorDetail(error));
    }
  };

  const save = (event) => {
    event.preventDefault();
    if (splittingNames) {
      handleSubmit((names) =>
        send({ lastNamePat: names.lastNamePat.trim(), lastNameMat: names.lastNameMat.trim(), firstName: names.firstName.trim() }),
      )(event);
    } else {
      send(null);
    }
  };

  return (
    <Box
      component="form"
      noValidate
      onSubmit={save}
      aria-label={`Fila ${row.rowNumber}`}
      sx={{ display: 'flex', flexDirection: 'column', gap: 1.75, p: { xs: '12px 20px 24px', md: 3 }, overflowY: 'auto' }}
    >
      <Typography component="h2" sx={{ fontSize: 18, fontWeight: 500 }}>
        Fila {row.rowNumber}
      </Typography>

      <Box sx={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '6px 12px', p: 1.5, borderRadius: '12px', bgcolor: '#EEF1F6', fontSize: 13 }}>
        <Label>Nombre</Label>
        <Box sx={{ fontWeight: 500 }}>{row.fullName}</Box>
        <Label>DNI</Label>
        <Box>{row.dni ?? '—'}</Box>
        {results ? (
          <>
            <Label>Puntaje total</Label>
            <Box>{row.result.totalScore ?? '—'}</Box>
            {row.result.areas.map((area) => (
              <Box key={area.areaName} sx={{ display: 'contents' }}>
                <Label>{area.areaName}</Label>
                <Box>{area.score}</Box>
              </Box>
            ))}
            <Label>Buenas / malas</Label>
            <Box>
              {row.result.totalCorrect} / {row.result.totalWrong}
              {row.result.attended ? '' : ' · No asistió'}
            </Box>
          </>
        ) : (
          <>
            <Label>Carrera</Label>
            <Box>{row.careerName ?? (row.careerText ? `Sin carrera ("${row.careerText}" no se encontró)` : '—')}</Box>
            <Label>Tutor</Label>
            <Box>{row.tutorName ?? (row.tutorText ? `Sin tutor ("${row.tutorText}" no se encontró)` : '—')}</Box>
          </>
        )}
      </Box>

      {row.notice && <Alert severity="warning">{row.notice}</Alert>}

      <RadioGroup
        value={choice}
        onChange={(e) => {
          setChoice(e.target.value);
          const chosen = found.find((s) => `student:${s.id}` === e.target.value);
          if (chosen) setPicked(chosen);
        }}
        aria-label="Resolución"
        sx={{ gap: 0.75 }}
      >
        {options.length > 0 && (
          <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>{row.candidates.length > 0 ? 'Puede ser' : 'Alumno'}</Typography>
        )}
        {options.map((student) => (
          <FormControlLabel
            key={student.id}
            value={`student:${student.id}`}
            disabled={!editable}
            control={<Radio />}
            label={
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <span>{student.fullName}</span>
                <Typography component="span" sx={{ fontSize: 12, color: 'text.secondary' }}>
                  {student.dni ? `DNI ${student.dni}` : 'Sin DNI'}
                  {student.active ? '' : ' · Dado de baja'}
                </Typography>
              </Box>
            }
          />
        ))}
        {editable && (
          <TextField
            size="small"
            label="Buscar otro alumno"
            placeholder="Apellido, nombre o DNI"
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            // Enter searches (it already does as you type): it never saves the row
            onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()}
          />
        )}
        <FormControlLabel value="new" disabled={!editable} control={<Radio />} label="Es un alumno nuevo" />
        {splittingNames && (
          <Box component="fieldset" disabled={!editable} sx={{ border: 0, m: 0, p: '0 0 0 32px', display: 'flex', flexDirection: 'column', gap: 1.25 }}>
            <Typography component="legend" sx={{ fontSize: 12, color: 'text.secondary', mb: 1 }}>
              Separa sus apellidos y nombres: el Excel los trae juntos. Se matriculará en la etapa del examen.
            </Typography>
            <TextField
              size="small"
              label="Apellido paterno"
              required
              {...register('lastNamePat')}
              error={Boolean(errors.lastNamePat)}
              helperText={errors.lastNamePat?.message}
            />
            <TextField
              size="small"
              label="Apellido materno"
              {...register('lastNameMat')}
              error={Boolean(errors.lastNameMat)}
              helperText={errors.lastNameMat?.message}
            />
            <TextField
              size="small"
              label="Nombres"
              required
              {...register('firstName')}
              error={Boolean(errors.firstName)}
              helperText={errors.firstName?.message}
            />
          </Box>
        )}
        <FormControlLabel value="ignore" disabled={!editable} control={<Radio />} label="Ignorar esta fila" />
      </RadioGroup>

      {serverError && <Alert severity="error">{serverError}</Alert>}

      <Box sx={{ display: 'flex', gap: 1, pt: 0.5 }}>
        <Button variant="outlined" onClick={onClose} disabled={isLoading} sx={{ flex: 1, height: 48 }}>
          {editable ? 'Cancelar' : 'Cerrar'}
        </Button>
        {editable && (
          <Button type="submit" variant="contained" disabled={!choice || isLoading} sx={{ flex: 1, height: 48 }}>
            Guardar resolución
          </Button>
        )}
      </Box>
    </Box>
  );
}

function Label({ children }) {
  return (
    <Box component="span" sx={{ color: 'text.secondary' }}>
      {children}
    </Box>
  );
}
