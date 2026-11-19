import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import FormLabel from '@mui/material/FormLabel';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import { formatDate, todayIso } from '../../academic/cycleDisplay';
import { errorDetail } from '../../app/api/errors';
import { useNotify } from '../../app/notifyContext';
import ConfirmDialog from '../../layout/ConfirmDialog';
import Pager from '../../layout/Pager';
import { PAGE_SIZES } from '../../layout/paging';
import { useGetMeQuery } from '../../users/api/authApi';
import { useCreateLogEntryMutation, useGetLogbookPageQuery } from '../api/logbookApi';

// the academy's sheet: reason and agreements; observations are optional for good
const FIELDS = [
  ['reason', 'Motivo de la sesión'],
  ['agreements', 'Compromisos / recomendaciones'],
  ['observations', 'Observaciones (opcional)'],
];
const WARNED_FIELDS = ['reason', 'agreements'];
const MEETING_WITH = {
  STUDENT: 'Alumno(a)',
  PARENT: 'Padre de familia o apoderado',
  BOTH: 'Ambos',
};

// what the backend checks too: a session date that is not in the future, and at least one text
const entrySchema = z
  .object({
    sessionDate: z
      .string()
      .min(1, 'Elige la fecha de la sesión')
      .refine((date) => date <= todayIso(), 'La fecha de la sesión no puede ser futura'),
    meetingWith: z.enum(['STUDENT', 'PARENT', 'BOTH'], { message: 'Elige con quién fue la reunión' }),
    reason: z.string().max(5000, 'Máximo 5000 caracteres'),
    agreements: z.string().max(5000, 'Máximo 5000 caracteres'),
    observations: z.string().max(5000, 'Máximo 5000 caracteres'),
  })
  .refine((v) => [v.reason, v.agreements, v.observations].some((text) => text.trim() !== ''), {
    message: 'Escribe al menos el motivo, los compromisos o las observaciones.',
    path: ['reason'],
  });

/** Only the student's current tutor writes (an admin only reads, even being an admin). */
function useIsCurrentTutor(student) {
  const { data: me } = useGetMeQuery();
  return Boolean(me?.roles?.includes('TUTOR') && student.tutorId != null && student.tutorId === me.id);
}

/**
 * "Bitácora" of a student (REQ-LOGBOOK-01/02): shown to ADMIN and the
 * student's current tutor (the page decides). The current tutor adds an
 * entry per session: its date, who they met (the student, the parent or
 * guardian, or both) and the texts of the academy's sheet; every save asks
 * first, because an entry can never be edited or deleted afterwards. The history spans every stage and tutor,
 * newest session first, 10 per page (paged by the backend).
 */
export default function LogbookSection({ student }) {
  const canWrite = useIsCurrentTutor(student);
  const [writing, setWriting] = useState(false);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(PAGE_SIZES[0]);

  return (
    <Box
      component="section"
      aria-labelledby="student-logbook-title"
      sx={{ bgcolor: 'background.paper', border: 1, borderColor: 'divider', borderRadius: '16px', p: 2.5, display: 'flex', flexDirection: 'column', gap: 2 }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap' }}>
        <Typography id="student-logbook-title" component="h2" sx={{ fontSize: 18, fontWeight: 500 }}>
          Bitácora
        </Typography>
        {canWrite && !writing && (
          <Button variant="outlined" startIcon={<AddIcon />} onClick={() => setWriting(true)} sx={{ height: 40 }}>
            Nueva entrada
          </Button>
        )}
      </Box>

      {writing && <EntryForm student={student} onDone={() => setWriting(false)} />}

      <EntriesPage
        studentId={student.id}
        page={page}
        size={size}
        onPageChange={setPage}
        onSizeChange={(next) => {
          setSize(next);
          setPage(0);
        }}
      />
    </Box>
  );
}

/** One page of the history, as the backend pages it, and the pager under it. */
function EntriesPage({ studentId, page, size, onPageChange, onSizeChange }) {
  const { data, isLoading, error } = useGetLogbookPageQuery({ studentId, page, size });
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
        <CircularProgress size={28} aria-label="Cargando bitácora" />
      </Box>
    );
  }
  if (error) return <Alert severity="error">{errorDetail(error)}</Alert>;
  const list = data?.entries ?? [];
  if (page === 0 && list.length === 0) {
    return <Typography sx={{ py: 2, textAlign: 'center', color: 'text.secondary' }}>Aún no hay entradas en la bitácora.</Typography>;
  }
  return (
    <>
      <Box component="ol" aria-label="Entradas de la bitácora" sx={{ listStyle: 'none', m: 0, p: 0, display: 'flex', flexDirection: 'column', gap: 1.25 }}>
        {list.map((entry) => (
          <Entry key={entry.id} entry={entry} />
        ))}
      </Box>
      <Pager count={data?.totalElements ?? 0} page={page} onPageChange={onPageChange} size={size} onSizeChange={onSizeChange} />
    </>
  );
}

function Entry({ entry }) {
  return (
    <Box
      component="li"
      aria-label={`Sesión del ${formatDate(entry.sessionDate)}`}
      sx={{ border: 1, borderColor: 'divider', borderRadius: '12px', p: 2, display: 'flex', flexDirection: 'column', gap: 1 }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap' }}>
        <Typography sx={{ fontSize: 14, fontWeight: 500 }}>{formatDate(entry.sessionDate)}</Typography>
        <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>{entry.authorName}</Typography>
      </Box>
      <Typography sx={{ fontSize: 13 }}>
        <Box component="span" sx={{ color: 'text.secondary' }}>
          Reunión con:{' '}
        </Box>
        {MEETING_WITH[entry.meetingWith] ?? entry.meetingWith}
      </Typography>
      {FIELDS.map(([field, label]) => (
        <Box key={field}>
          <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>{label}</Typography>
          <Typography sx={{ fontSize: 14, whiteSpace: 'pre-wrap', color: entry[field] ? 'text.primary' : 'text.secondary' }}>
            {entry[field] ?? '—'}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}

function EntryForm({ student, onDone }) {
  const notify = useNotify();
  const [serverError, setServerError] = useState(null);
  // the values waiting for the user to accept that they cannot be changed later
  const [pending, setPending] = useState(null);
  const [createLogEntry, { isLoading }] = useCreateLogEntryMutation();
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(entrySchema),
    defaultValues: { sessionDate: todayIso(), meetingWith: '', reason: '', agreements: '', observations: '' },
  });

  const save = async () => {
    setServerError(null);
    try {
      // the user already accepted the empty fields in the dialog
      await createLogEntry({ studentId: student.id, ...pending, confirm: true }).unwrap();
      notify('Entrada registrada en la bitácora.');
      onDone();
    } catch (error) {
      setServerError(errorDetail(error)); // the typed text stays
      setPending(null);
    }
  };

  const empty = pending
    ? FIELDS.filter(([field]) => WARNED_FIELDS.includes(field) && pending[field].trim() === '').map(([, label]) => label.toLowerCase())
    : [];

  return (
    <Box
      component="form"
      noValidate
      aria-label="Nueva entrada de bitácora"
      onSubmit={handleSubmit((values) => setPending(values))}
      sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, p: 2, borderRadius: '12px', bgcolor: '#F4F6FA' }}
    >
      <TextField
        label="Fecha de la sesión"
        type="date"
        required
        size="small"
        slotProps={{ inputLabel: { shrink: true }, htmlInput: { max: todayIso() } }}
        {...register('sessionDate')}
        error={Boolean(errors.sessionDate)}
        helperText={errors.sessionDate?.message}
        sx={{ maxWidth: 220 }}
      />
      <Controller
        name="meetingWith"
        control={control}
        render={({ field }) => (
          <FormControl error={Boolean(errors.meetingWith)} required>
            <FormLabel id="meeting-with-label" sx={{ fontSize: 14 }}>
              ¿Con quién fue la reunión?
            </FormLabel>
            <RadioGroup row aria-labelledby="meeting-with-label" {...field}>
              {Object.entries(MEETING_WITH).map(([value, label]) => (
                <FormControlLabel key={value} value={value} control={<Radio size="small" />} label={label} />
              ))}
            </RadioGroup>
            {errors.meetingWith && <FormHelperText>{errors.meetingWith.message}</FormHelperText>}
          </FormControl>
        )}
      />
      {FIELDS.map(([field, label]) => (
        <TextField
          key={field}
          label={label}
          multiline
          minRows={2}
          {...register(field)}
          error={Boolean(errors[field])}
          helperText={errors[field]?.message}
        />
      ))}
      <Alert severity="info">Una vez guardada, la entrada no se puede editar ni borrar. Para corregirla, agrega una entrada nueva.</Alert>
      {serverError && <Alert severity="error">{serverError}</Alert>}
      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
        <Button variant="outlined" onClick={onDone} disabled={isLoading} sx={{ minWidth: 120, height: 44 }}>
          Cancelar
        </Button>
        <Button type="submit" variant="contained" color="secondary" disabled={isLoading} sx={{ minWidth: 120, height: 44 }}>
          Guardar
        </Button>
      </Box>

      {pending && (
        <ConfirmDialog
          title="¿Guardar la entrada?"
          message={
            (empty.length > 0 ? `Quedaron vacíos: ${empty.join(', ')}. ` : '') +
            'Después de guardarla no podrás editarla ni borrarla.'
          }
          confirmLabel="Guardar"
          loading={isLoading}
          onConfirm={save}
          onCancel={() => setPending(null)}
        />
      )}
    </Box>
  );
}
