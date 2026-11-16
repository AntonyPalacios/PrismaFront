import { useEffect, useState } from 'react';
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

const SEARCH_DELAY_MS = 300;

/** The row's choice as one value: 'student:<id>', 'new' or 'ignore' ('' = not decided). */
function currentChoice(row) {
  if (row.status === 'IGNORED') return 'ignore';
  if (row.status === 'NEW_STUDENT') return 'new';
  if (row.student && row.status !== 'UNRESOLVED') return `student:${row.student.id}`;
  return '';
}

/**
 * "Fila N" (Claude Design: RowResolutionMobile): the row as read, and what
 * it is — one of the suggested students, another one found by name or DNI,
 * a new student, or ignored. Saved with "Guardar resolución".
 */
export default function RowResolution({ batchId, row, editable, onClose }) {
  return (
    <ResponsiveSheet onClose={onClose}>
      <RowResolutionContent batchId={batchId} row={row} editable={editable} onClose={onClose} />
    </ResponsiveSheet>
  );
}

function RowResolutionContent({ batchId, row, editable, onClose }) {
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

  useEffect(() => {
    const timer = setTimeout(() => setQuery(typed.trim()), SEARCH_DELAY_MS);
    return () => clearTimeout(timer);
  }, [typed]);

  // the suggested students, the one already chosen and those found, once each
  const options = [...(row.student ? [row.student] : []), ...row.candidates, ...(picked ? [picked] : []), ...found].filter(
    (student, index, all) => all.findIndex((s) => s.id === student.id) === index,
  );

  const save = async () => {
    setServerError(null);
    const [action, id] = choice === 'new' ? ['NEW'] : choice === 'ignore' ? ['IGNORE'] : ['MATCH', Number(choice.split(':')[1])];
    try {
      await resolve({ batchId, rowId: row.id, action, studentId: id ?? null }).unwrap();
      notify(`Fila ${row.rowNumber} resuelta.`);
      onClose();
    } catch (error) {
      setServerError(errorDetail(error));
    }
  };

  return (
    <Box
      component="section"
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
        <Label>Carrera</Label>
        <Box>{row.careerName ?? (row.careerText ? `Sin carrera ("${row.careerText}" no se encontró)` : '—')}</Box>
        <Label>Tutor</Label>
        <Box>{row.tutorName ?? (row.tutorText ? `Sin tutor ("${row.tutorText}" no se encontró)` : '—')}</Box>
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
          />
        )}
        <FormControlLabel value="new" disabled={!editable} control={<Radio />} label="Es un alumno nuevo" />
        <FormControlLabel value="ignore" disabled={!editable} control={<Radio />} label="Ignorar esta fila" />
      </RadioGroup>

      {serverError && <Alert severity="error">{serverError}</Alert>}

      <Box sx={{ display: 'flex', gap: 1, pt: 0.5 }}>
        <Button variant="outlined" onClick={onClose} disabled={isLoading} sx={{ flex: 1, height: 48 }}>
          {editable ? 'Cancelar' : 'Cerrar'}
        </Button>
        {editable && (
          <Button variant="contained" onClick={save} disabled={!choice || isLoading} sx={{ flex: 1, height: 48 }}>
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
