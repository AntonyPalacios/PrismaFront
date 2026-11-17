import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import { formatDate, todayIso } from '../../academic/cycleDisplay';
import { errorDetail } from '../../app/api/errors';
import { useNotify } from '../../app/notifyContext';
import ConfirmDialog from '../../layout/ConfirmDialog';
import { useGetMeQuery } from '../../users/api/authApi';
import { useCreateLogEntryMutation, useGetLogbookPageQuery } from '../api/logbookApi';

const PAGE_SIZE = 20;
const FIELDS = [
  ['reason', 'Motivo de la sesión'],
  ['agreements', 'Acuerdos'],
  ['observations', 'Observaciones'],
];

// what the backend checks too: a session date that is not in the future, and at least one text
const entrySchema = z
  .object({
    sessionDate: z
      .string()
      .min(1, 'Elige la fecha de la sesión')
      .refine((date) => date <= todayIso(), 'La fecha de la sesión no puede ser futura'),
    reason: z.string().max(5000, 'Máximo 5000 caracteres'),
    agreements: z.string().max(5000, 'Máximo 5000 caracteres'),
    observations: z.string().max(5000, 'Máximo 5000 caracteres'),
  })
  .refine((v) => [v.reason, v.agreements, v.observations].some((text) => text.trim() !== ''), {
    message: 'Escribe al menos el motivo, los acuerdos o las observaciones.',
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
 * entry per session; every save asks first, because an entry can never be
 * edited or deleted afterwards. The history spans every stage and tutor,
 * newest session first, 20 at a time.
 */
export default function LogbookSection({ student }) {
  const canWrite = useIsCurrentTutor(student);
  const [writing, setWriting] = useState(false);
  // how many pages of 20 are shown ("Ver más" adds one)
  const [pages, setPages] = useState(1);

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

      <Box component="ol" aria-label="Entradas de la bitácora" sx={{ listStyle: 'none', m: 0, p: 0, display: 'flex', flexDirection: 'column', gap: 1.25 }}>
        {Array.from({ length: pages }, (_, page) => (
          <EntriesPage key={page} studentId={student.id} page={page} last={page === pages - 1} onMore={() => setPages(pages + 1)} />
        ))}
      </Box>
    </Box>
  );
}

function EntriesPage({ studentId, page, last, onMore }) {
  const { data, isLoading, error } = useGetLogbookPageQuery({ studentId, page, size: PAGE_SIZE });
  if (isLoading) {
    return (
      <Box component="li" sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
        <CircularProgress size={28} aria-label="Cargando bitácora" />
      </Box>
    );
  }
  if (error) {
    return (
      <Box component="li">
        <Alert severity="error">{errorDetail(error)}</Alert>
      </Box>
    );
  }
  const list = data?.entries ?? [];
  if (page === 0 && list.length === 0) {
    return (
      <Box component="li">
        <Typography sx={{ py: 2, textAlign: 'center', color: 'text.secondary' }}>Aún no hay entradas en la bitácora.</Typography>
      </Box>
    );
  }
  return (
    <>
      {list.map((entry) => (
        <Entry key={entry.id} entry={entry} />
      ))}
      {last && data?.hasMore && (
        <Box component="li" sx={{ display: 'flex', justifyContent: 'center' }}>
          <Button onClick={onMore}>Ver más</Button>
        </Box>
      )}
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
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(entrySchema),
    defaultValues: { sessionDate: todayIso(), reason: '', agreements: '', observations: '' },
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

  const empty = pending ? FIELDS.filter(([field]) => pending[field].trim() === '').map(([, label]) => label.toLowerCase()) : [];

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
