import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import FormHelperText from '@mui/material/FormHelperText';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { formatDate, stageDates } from '../../academic/cycleDisplay';
import { errorDetail } from '../../app/api/errors';
import { useNotify } from '../../app/notifyContext';
import { colors } from '../../app/theme';
import { useGetExamTypesQuery } from '../../catalog/api/examTypesApi';
import ConfirmDialog from '../../layout/ConfirmDialog';
import ResponsiveSheet from '../../layout/ResponsiveSheet';
import { useCreateExamsMutation, useDeleteExamMutation, useUpdateExamMutation } from '../api/examsApi';

const base = {
  name: z.string().trim().min(1, 'El examen necesita un nombre.').max(200, 'El nombre del examen es demasiado largo.'),
  examDate: z.string().min(1, 'Ingresa la fecha del examen.'),
};
const createSchema = z.object({ ...base, examTypeIds: z.array(z.string()).min(1, 'Elige al menos un tipo de examen.') });
const editSchema = z.object({ ...base, examTypeId: z.string().min(1, 'Elige el tipo de examen.') });

const dateProps = { type: 'date', slotProps: { inputLabel: { shrink: true } } };

/**
 * "Nuevo examen" (exam = null) or an existing exam (Claude Design:
 * ExamsMobile, "Ver / editar examen"). Creating a mock exam: name, date and
 * the exam types (all checked by default), one exam per type. Editing: name,
 * date and type — the type is locked once the exam has results — and
 * "Eliminar" while it has none. Read-only for a TUTOR and in a closed cycle.
 * Bottom sheet on mobile, dialog on desktop.
 */
export default function ExamForm({ cycle, stage, exam, canManage, onClose }) {
  const editable = canManage && cycle.status !== 'CLOSED';
  return (
    <ResponsiveSheet onClose={onClose}>
      {exam ? (
        <EditExam cycle={cycle} stage={stage} exam={exam} editable={editable} canManage={canManage} onClose={onClose} />
      ) : (
        <CreateExams cycle={cycle} stage={stage} onClose={onClose} />
      )}
    </ResponsiveSheet>
  );
}

function FormFrame({ title, subtitle, onSubmit, children }) {
  return (
    <Box
      component="form"
      noValidate
      onSubmit={onSubmit}
      aria-label={title}
      sx={{ display: 'flex', flexDirection: 'column', gap: 1.75, p: { xs: '12px 20px 24px', md: 3 }, overflowY: 'auto' }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        <Typography component="h2" sx={{ fontSize: 18, fontWeight: 500 }}>
          {title}
        </Typography>
        <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>{subtitle}</Typography>
      </Box>
      {children}
    </Box>
  );
}

const stageLabel = (cycle, stage) => `${cycle.name} · ${stage.name} (${stageDates(stage)})`;

function CreateExams({ cycle, stage, onClose }) {
  const notify = useNotify();
  const [serverError, setServerError] = useState(null);
  const [createExams] = useCreateExamsMutation();
  const { data: types = [] } = useGetExamTypesQuery();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(createSchema),
    // every type checked by default: a mock exam usually covers the three tracks
    values: { name: '', examDate: '', examTypeIds: types.map((t) => String(t.id)) },
    resetOptions: { keepDirtyValues: true },
  });

  const onSubmit = async (values) => {
    setServerError(null);
    try {
      const created = await createExams({
        stageId: stage.id,
        name: values.name.trim(),
        examDate: values.examDate,
        examTypeIds: values.examTypeIds.map(Number),
      }).unwrap();
      notify(created.length === 1 ? 'Examen creado.' : `${created.length} exámenes creados.`);
      onClose();
    } catch (error) {
      setServerError(errorDetail(error)); // e.g. 409: keep what was typed
    }
  };

  return (
    <FormFrame
      title="Nuevo examen"
      subtitle={`${stageLabel(cycle, stage)}. Se crea un examen por cada tipo marcado.`}
      onSubmit={handleSubmit(onSubmit)}
    >
      <TextField
        label="Nombre"
        required
        autoFocus
        placeholder="Ej. Regular 1"
        {...register('name')}
        error={Boolean(errors.name)}
        helperText={errors.name?.message}
      />
      <TextField
        label="Fecha"
        required
        {...dateProps}
        {...register('examDate')}
        error={Boolean(errors.examDate)}
        helperText={errors.examDate?.message}
      />
      <Controller
        control={control}
        name="examTypeIds"
        render={({ field }) => (
          <Box component="fieldset" sx={{ border: 0, p: 0, m: 0 }}>
            <Typography component="legend" sx={{ fontSize: 13, color: 'text.secondary', mb: 0.5 }}>
              Tipos de examen *
            </Typography>
            <FormGroup row>
              {types.map((type) => {
                const id = String(type.id);
                const checked = field.value.includes(id);
                return (
                  <FormControlLabel
                    key={type.id}
                    label={type.name}
                    control={
                      <Checkbox
                        checked={checked}
                        onChange={() => field.onChange(checked ? field.value.filter((v) => v !== id) : [...field.value, id])}
                      />
                    }
                  />
                );
              })}
            </FormGroup>
            {errors.examTypeIds && <FormHelperText error>{errors.examTypeIds.message}</FormHelperText>}
          </Box>
        )}
      />

      {serverError && <Alert severity="error">{serverError}</Alert>}

      <Box sx={{ display: 'flex', gap: 1, pt: 0.5 }}>
        <Button variant="outlined" onClick={onClose} disabled={isSubmitting} sx={{ flex: 1, height: 48 }}>
          Cancelar
        </Button>
        <Button type="submit" variant="contained" color="secondary" disabled={isSubmitting} sx={{ flex: 1, height: 48 }}>
          Crear
        </Button>
      </Box>
    </FormFrame>
  );
}

function EditExam({ cycle, stage, exam, editable, canManage, onClose }) {
  const notify = useNotify();
  const [serverError, setServerError] = useState(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [updateExam] = useUpdateExamMutation();
  const [deleteExam, { isLoading: deleting }] = useDeleteExamMutation();
  const { data: types = [] } = useGetExamTypesQuery();
  const title = `${exam.name} · ${exam.examTypeName}`;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = useForm({
    resolver: zodResolver(editSchema),
    values: { name: exam.name, examDate: exam.examDate, examTypeId: String(exam.examTypeId) },
    resetOptions: { keepDirtyValues: true },
  });

  const onSubmit = async (values) => {
    setServerError(null);
    try {
      await updateExam({
        id: exam.id,
        name: values.name.trim(),
        examDate: values.examDate,
        examTypeId: Number(values.examTypeId),
      }).unwrap();
      notify('Examen actualizado.');
      onClose();
    } catch (error) {
      setServerError(errorDetail(error));
    }
  };

  const confirmDelete = async () => {
    try {
      await deleteExam(exam.id).unwrap();
      notify('Examen eliminado.');
      onClose();
    } catch (error) {
      setServerError(errorDetail(error));
      setConfirmingDelete(false);
    }
  };

  let note = null;
  if (!canManage) note = 'Solo el administrador y el coordinador editan los exámenes.';
  else if (!editable) note = 'Este ciclo está cerrado: sus exámenes quedan como historial.';

  return (
    <FormFrame title={title} subtitle={`${formatDate(exam.examDate)} · ${stageLabel(cycle, stage)}`} onSubmit={handleSubmit(onSubmit)}>
      <TextField label="Nombre" required disabled={!editable} {...register('name')} error={Boolean(errors.name)} helperText={errors.name?.message} />
      <TextField
        label="Fecha"
        required
        disabled={!editable}
        {...dateProps}
        {...register('examDate')}
        error={Boolean(errors.examDate)}
        helperText={errors.examDate?.message}
      />
      <TextField
        select
        fullWidth
        label="Tipo de examen"
        disabled={!editable || exam.hasResults}
        slotProps={{ select: { native: true }, inputLabel: { shrink: true } }}
        {...register('examTypeId')}
        helperText={exam.hasResults ? 'Ya tiene resultados: su tipo no se puede cambiar.' : ' '}
      >
        {types.map((type) => (
          <option key={type.id} value={type.id}>
            {type.name}
          </option>
        ))}
      </TextField>

      {note && <Alert severity="info">{note}</Alert>}
      {serverError && <Alert severity="error">{serverError}</Alert>}

      {editable ? (
        <Box sx={{ display: 'flex', gap: 1, pt: 0.5 }}>
          {!exam.hasResults && (
            <Button
              variant="outlined"
              onClick={() => setConfirmingDelete(true)}
              disabled={isSubmitting}
              sx={{ flex: 1, height: 48, borderColor: '#C5CCD8', color: colors.danger }}
            >
              Eliminar
            </Button>
          )}
          <Button type="submit" variant="contained" disabled={isSubmitting || !isDirty} sx={{ flex: 1, height: 48 }}>
            Guardar
          </Button>
        </Box>
      ) : (
        <Button variant="outlined" onClick={onClose} sx={{ height: 48 }}>
          Cerrar
        </Button>
      )}

      {confirmingDelete && (
        <ConfirmDialog
          title="¿Eliminar examen?"
          message={`${title} (${formatDate(exam.examDate)}) dejará de aparecer en la etapa. Solo se puede eliminar porque aún no tiene resultados.`}
          confirmLabel="Eliminar"
          danger
          loading={deleting}
          onConfirm={confirmDelete}
          onCancel={() => setConfirmingDelete(false)}
        />
      )}
    </FormFrame>
  );
}
