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
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import CloseIcon from '@mui/icons-material/Close';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined';
import { formatDate, stageDates } from '../../academic/cycleDisplay';
import { errorDetail } from '../../app/api/errors';
import { useNotify } from '../../app/notifyContext';
import { colors } from '../../app/theme';
import { useGetExamTypesQuery } from '../../catalog/api/examTypesApi';
import ConfirmDialog from '../../layout/ConfirmDialog';
import ResponsiveSheet from '../../layout/ResponsiveSheet';
import { useIsAdmin } from '../../users/api/authApi';
import {
  useAddExamTypeMutation,
  useCreateMockExamMutation,
  useDeleteMockExamMutation,
  useRemoveExamTypeMutation,
  useUpdateMockExamMutation,
} from '../api/examsApi';

const base = {
  name: z.string().trim().min(1, 'El examen necesita un nombre.').max(200, 'El nombre del examen es demasiado largo.'),
  examDate: z.string().min(1, 'Ingresa la fecha del examen.'),
};
const createSchema = z.object({ ...base, examTypeIds: z.array(z.string()).min(1, 'Elige al menos un tipo de examen.') });
const editSchema = z.object(base);

const dateProps = { type: 'date', slotProps: { inputLabel: { shrink: true } } };

const stageLabel = (cycle, stage) => `${cycle.name} · ${stage.name} (${stageDates(stage)})`;

/**
 * "Nuevo examen" (mockExam = null) or an existing mock exam (Claude Design:
 * ExamsMobile, "Ver / editar examen"). Creating: name, date and the exam
 * types (all checked by default). Editing: name and date, which apply to
 * every type; add a missing type or remove one without results (never the
 * last); "Eliminar" while no type has results. Read-only for a TUTOR and in
 * a closed cycle. Every role may "Importar resultados" of a type without
 * results while the stage is the one in force of the active cycle, and an
 * ADMIN may "Recargar resultados" of a type that has them (`onImport`). Every
 * role may type a student's "Resultado manual" in a type with results while
 * the cycle is not closed (`onManual`). Bottom sheet on mobile, dialog on desktop.
 */
export default function ExamForm({ cycle, stage, mockExam, canManage, onImport, onManual, onClose }) {
  const editable = canManage && cycle.status !== 'CLOSED';
  return (
    <ResponsiveSheet onClose={onClose}>
      {mockExam ? (
        <EditMockExam
          cycle={cycle}
          stage={stage}
          mockExam={mockExam}
          editable={editable}
          canManage={canManage}
          onImport={stage.current && cycle.status === 'ACTIVE' ? onImport : null}
          onManual={cycle.status !== 'CLOSED' ? onManual : null}
          onClose={onClose}
        />
      ) : (
        <CreateMockExam cycle={cycle} stage={stage} onClose={onClose} />
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

function CreateMockExam({ cycle, stage, onClose }) {
  const notify = useNotify();
  const [serverError, setServerError] = useState(null);
  const [createMockExam] = useCreateMockExamMutation();
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
      await createMockExam({
        stageId: stage.id,
        name: values.name.trim(),
        examDate: values.examDate,
        examTypeIds: values.examTypeIds.map(Number),
      }).unwrap();
      notify('Examen creado.');
      onClose();
    } catch (error) {
      setServerError(errorDetail(error)); // e.g. 409: keep what was typed
    }
  };

  return (
    <FormFrame title="Nuevo examen" subtitle={`${stageLabel(cycle, stage)}. Marca los tipos de examen que se tomarán.`} onSubmit={handleSubmit(onSubmit)}>
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

function EditMockExam({ cycle, stage, mockExam, editable, canManage, onImport, onManual, onClose }) {
  const notify = useNotify();
  const [serverError, setServerError] = useState(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [updateMockExam] = useUpdateMockExamMutation();
  const [deleteMockExam, { isLoading: deleting }] = useDeleteMockExamMutation();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = useForm({
    resolver: zodResolver(editSchema),
    values: { name: mockExam.name, examDate: mockExam.examDate },
    resetOptions: { keepDirtyValues: true },
  });

  const onSubmit = async (values) => {
    setServerError(null);
    try {
      await updateMockExam({ id: mockExam.id, name: values.name.trim(), examDate: values.examDate }).unwrap();
      notify('Examen actualizado.');
      onClose();
    } catch (error) {
      setServerError(errorDetail(error));
    }
  };

  const confirmDelete = async () => {
    try {
      await deleteMockExam(mockExam.id).unwrap();
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
    <FormFrame title={mockExam.name} subtitle={`${formatDate(mockExam.examDate)} · ${stageLabel(cycle, stage)}`} onSubmit={handleSubmit(onSubmit)}>
      <TextField label="Nombre" required disabled={!editable} {...register('name')} error={Boolean(errors.name)} helperText={errors.name?.message} />
      <TextField
        label="Fecha"
        required
        disabled={!editable}
        {...dateProps}
        {...register('examDate')}
        error={Boolean(errors.examDate)}
        helperText={errors.examDate?.message ?? (editable ? 'El nombre y la fecha se aplican a todos sus tipos.' : ' ')}
      />

      <ExamTypes mockExam={mockExam} editable={editable} onImport={onImport} onManual={onManual} onError={setServerError} />

      {note && <Alert severity="info">{note}</Alert>}
      {serverError && <Alert severity="error">{serverError}</Alert>}

      {editable ? (
        <Box sx={{ display: 'flex', gap: 1, pt: 0.5 }}>
          {!mockExam.hasResults && (
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
          message={`${mockExam.name} (${formatDate(mockExam.examDate)}) y sus tipos de examen dejarán de aparecer en la etapa. Solo se puede eliminar porque aún no tiene resultados.`}
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

/**
 * The mock exam's exam types, each saved on its own (they are not part of
 * the name/date form): remove one without results (never the last) or add
 * one it is missing, and import the results of one without them or, an
 * admin, reload those of one that has them (`onImport(exam, reload)`, null
 * when not allowed), and type one student's result in a type with results
 * (`onManual(exam)`, null in a closed cycle). No <form> here: it lives inside the
 * mock exam's form.
 */
function ExamTypes({ mockExam, editable, onImport, onManual, onError }) {
  const notify = useNotify();
  // the forced reload of a type that already has results is only the admin's
  const isAdmin = useIsAdmin();
  const [adding, setAdding] = useState('');
  const { data: types = [] } = useGetExamTypesQuery();
  const [addExamType, { isLoading: addingType }] = useAddExamTypeMutation();
  const [removeExamType, { isLoading: removing }] = useRemoveExamTypeMutation();
  const missing = types.filter((type) => !mockExam.exams.some((exam) => exam.examTypeId === type.id));
  const canRemove = editable && mockExam.exams.length > 1;

  const add = async () => {
    onError(null);
    try {
      await addExamType({ mockExamId: mockExam.id, examTypeId: Number(adding) }).unwrap();
      notify('Tipo de examen agregado.');
      setAdding('');
    } catch (error) {
      onError(errorDetail(error));
    }
  };

  const remove = async (exam) => {
    onError(null);
    try {
      await removeExamType({ mockExamId: mockExam.id, examId: exam.id }).unwrap();
      notify(`Se quitó ${exam.examTypeName}.`);
    } catch (error) {
      onError(errorDetail(error));
    }
  };

  return (
    <Box component="section" aria-labelledby="mock-exam-types-title" sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      <Typography id="mock-exam-types-title" component="h3" sx={{ fontSize: 14, fontWeight: 500 }}>
        Tipos de examen
      </Typography>
      <Box component="ul" aria-label="Tipos de examen" sx={{ listStyle: 'none', m: 0, p: 0, display: 'flex', flexDirection: 'column', gap: 0.75 }}>
        {mockExam.exams.map((exam) => (
          <Box
            component="li"
            key={exam.id}
            sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1, px: 1.5, py: 0.75, borderRadius: '12px', bgcolor: '#F4F6FA' }}
          >
            <Typography sx={{ flex: 1, fontSize: 14, fontWeight: 500 }}>{exam.examTypeName}</Typography>
            <Typography sx={{ fontSize: 12, color: exam.hasResults ? '#2F5A08' : 'text.secondary' }}>
              {exam.hasResults ? 'Con resultados' : 'Sin resultados'}
            </Typography>
            {onImport && !exam.hasResults && (
              <Button
                type="button"
                size="small"
                startIcon={<FileUploadOutlinedIcon />}
                aria-label={`Importar resultados de ${exam.examTypeName}`}
                onClick={() => onImport(exam)}
              >
                Importar resultados
              </Button>
            )}
            {onManual && exam.hasResults && (
              <Button
                type="button"
                size="small"
                startIcon={<EditOutlinedIcon />}
                aria-label={`Resultado manual de ${exam.examTypeName}`}
                onClick={() => onManual(exam)}
              >
                Resultado manual
              </Button>
            )}
            {onImport && exam.hasResults && isAdmin && (
              <Button
                type="button"
                size="small"
                color="warning"
                startIcon={<FileUploadOutlinedIcon />}
                aria-label={`Recargar resultados de ${exam.examTypeName}`}
                onClick={() => onImport(exam, true)}
              >
                Recargar resultados
              </Button>
            )}
            {canRemove && !exam.hasResults && (
              <IconButton size="small" aria-label={`Quitar ${exam.examTypeName}`} disabled={removing} onClick={() => remove(exam)}>
                <CloseIcon fontSize="small" />
              </IconButton>
            )}
          </Box>
        ))}
      </Box>
      {editable && missing.length > 0 && (
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <TextField
            select
            size="small"
            label="Agregar tipo"
            value={adding}
            onChange={(e) => setAdding(e.target.value)}
            slotProps={{ select: { native: true }, inputLabel: { shrink: true } }}
            sx={{ flex: 1 }}
          >
            <option value="">Elige un tipo…</option>
            {missing.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </TextField>
          <Button type="button" variant="outlined" onClick={add} disabled={!adding || addingType} sx={{ height: 40 }}>
            Agregar
          </Button>
        </Box>
      )}
    </Box>
  );
}
