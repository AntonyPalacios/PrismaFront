import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useGetCyclesQuery } from '../../academic/api/cyclesApi';
import { useGetStagesQuery } from '../../academic/api/stagesApi';
import { errorDetail } from '../../app/api/errors';
import { useNotify } from '../../app/notifyContext';
import { colors } from '../../app/theme';
import { useGetCareersQuery } from '../../catalog/api/careersApi';
import ConfirmDialog from '../../layout/ConfirmDialog';
import ResponsiveSheet from '../../layout/ResponsiveSheet';
import {
  useCreateEnrollmentMutation,
  useUpdateEnrollmentMutation,
  useWithdrawEnrollmentMutation,
} from '../api/enrollmentsApi';
import TutorCard from '../../tutoring/components/TutorCard';
import { careerLabel, isEnrollmentEditable } from '../enrollmentDisplay';
import { studentFullName } from '../studentDisplay';

const createSchema = z.object({
  cycleId: z.string(),
  stageId: z.string().min(1, 'Elige la etapa de la matrícula.'),
  careerId: z.string(),
});

const editSchema = z.object({ careerId: z.string() });

const toId = (value) => (value ? Number(value) : null);

// native selects: the phone's own picker on mobile, and register() just works
const selectProps = { select: true, fullWidth: true, slotProps: { select: { native: true }, inputLabel: { shrink: true } } };

/**
 * "Nueva matrícula" (enrollment = null) or an existing enrollment
 * (Claude Design: EnrollmentTutorMobile). Creating: Ciclo (cycles not
 * closed), Etapa (its stages where the student has no enrollment yet) and
 * an optional Carrera. Editing: only the career changes, and "Retirar de la
 * etapa" asks first; a withdrawn enrollment or one of a closed cycle only
 * shows its data. Bottom sheet on mobile, dialog on desktop.
 */
export default function EnrollmentForm({ student, enrollment, enrollments, onClose }) {
  return (
    <ResponsiveSheet onClose={onClose}>
      {enrollment ? (
        <EditEnrollment student={student} enrollment={enrollment} onClose={onClose} />
      ) : (
        <CreateEnrollment student={student} enrollments={enrollments} onClose={onClose} />
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

function useActiveCareers() {
  const { data: careers = [] } = useGetCareersQuery();
  return careers.filter((career) => career.active);
}

function CreateEnrollment({ student, enrollments, onClose }) {
  const notify = useNotify();
  const [serverError, setServerError] = useState(null);
  const [createEnrollment] = useCreateEnrollmentMutation();
  const { data: cycles = [], isLoading: loadingCycles } = useGetCyclesQuery();
  const careers = useActiveCareers();
  const openCycles = cycles.filter((cycle) => cycle.status !== 'CLOSED');
  const defaultCycle = openCycles.find((cycle) => cycle.status === 'ACTIVE') ?? openCycles[0];

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(createSchema),
    values: { cycleId: defaultCycle ? String(defaultCycle.id) : '', stageId: '', careerId: '' },
    resetOptions: { keepDirtyValues: true },
  });
  const cycleId = useWatch({ control, name: 'cycleId' });
  const { data: stages = [] } = useGetStagesQuery(cycleId, { skip: !cycleId });
  const enrolledStageIds = new Set(enrollments.map((e) => e.stageId));
  const availableStages = stages.filter((stage) => !enrolledStageIds.has(stage.id));

  const onSubmit = async (values) => {
    setServerError(null);
    try {
      await createEnrollment({ studentId: student.id, stageId: toId(values.stageId), careerId: toId(values.careerId) }).unwrap();
      notify('Alumno matriculado.');
      onClose();
    } catch (error) {
      setServerError(errorDetail(error)); // e.g. 409: keep what was chosen
    }
  };

  const cycleField = register('cycleId');
  return (
    <FormFrame
      title="Nueva matrícula"
      subtitle={`${studentFullName(student)}. La carrera es opcional: se puede completar después.`}
      onSubmit={handleSubmit(onSubmit)}
    >
      {!loadingCycles && openCycles.length === 0 ? (
        <Alert severity="info">No hay ciclos abiertos: crea o activa un ciclo antes de matricular.</Alert>
      ) : (
        <>
          <TextField
            {...selectProps}
            label="Ciclo"
            {...cycleField}
            onChange={(e) => {
              cycleField.onChange(e);
              setValue('stageId', ''); // the stages belong to the cycle
            }}
          >
            {openCycles.map((cycle) => (
              <option key={cycle.id} value={cycle.id}>
                {cycle.name}
              </option>
            ))}
          </TextField>
          <TextField
            {...selectProps}
            label="Etapa *"
            {...register('stageId')}
            error={Boolean(errors.stageId)}
            helperText={
              errors.stageId?.message ??
              (cycleId && stages.length > 0 && availableStages.length === 0 ? 'El alumno ya está matriculado en todas las etapas de este ciclo.' : ' ')
            }
          >
            <option value="">Elige una etapa…</option>
            {availableStages.map((stage) => (
              <option key={stage.id} value={stage.id}>
                {stage.name}
              </option>
            ))}
          </TextField>
          <CareerSelect register={register} careers={careers} />
        </>
      )}

      {serverError && <Alert severity="error">{serverError}</Alert>}

      <Box sx={{ display: 'flex', gap: 1, pt: 0.5 }}>
        <Button variant="outlined" onClick={onClose} disabled={isSubmitting} sx={{ flex: 1, height: 48 }}>
          Cancelar
        </Button>
        <Button
          type="submit"
          variant="contained"
          color="secondary"
          disabled={isSubmitting || openCycles.length === 0}
          sx={{ flex: 1, height: 48 }}
        >
          Matricular
        </Button>
      </Box>
    </FormFrame>
  );
}

function CareerSelect({ register, careers }) {
  return (
    <TextField {...selectProps} label="Carrera (opcional)" {...register('careerId')}>
      <option value="">Sin definir</option>
      {careers.map((career) => (
        <option key={career.id} value={career.id}>
          {career.name}
        </option>
      ))}
    </TextField>
  );
}

function InfoRow({ label, value }) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, fontSize: 14, py: 0.5 }}>
      <Box component="span" sx={{ color: 'text.secondary' }}>
        {label}
      </Box>
      <Box component="span" sx={{ fontWeight: 500, textAlign: 'right' }}>
        {value}
      </Box>
    </Box>
  );
}

function EditEnrollment({ student, enrollment, onClose }) {
  const notify = useNotify();
  const editable = isEnrollmentEditable(enrollment);
  const [serverError, setServerError] = useState(null);
  const [confirmingWithdraw, setConfirmingWithdraw] = useState(false);
  const [updateEnrollment] = useUpdateEnrollmentMutation();
  const [withdrawEnrollment, { isLoading: withdrawing }] = useWithdrawEnrollmentMutation();
  const activeCareers = useActiveCareers();
  // a career deactivated after it was chosen stays selectable for this enrollment
  const careers =
    enrollment.careerId && !activeCareers.some((c) => c.id === enrollment.careerId)
      ? [...activeCareers, { id: enrollment.careerId, name: enrollment.careerName }]
      : activeCareers;
  const name = studentFullName(student);

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm({
    resolver: zodResolver(editSchema),
    values: { careerId: enrollment.careerId ? String(enrollment.careerId) : '' },
    resetOptions: { keepDirtyValues: true },
  });

  const onSubmit = async (values) => {
    setServerError(null);
    try {
      await updateEnrollment({ id: enrollment.id, careerId: toId(values.careerId) }).unwrap();
      notify('Carrera guardada.');
      onClose();
    } catch (error) {
      setServerError(errorDetail(error));
    }
  };

  const confirmWithdraw = async () => {
    try {
      await withdrawEnrollment(enrollment.id).unwrap();
      notify('Alumno retirado de la etapa.');
      onClose();
    } catch (error) {
      setServerError(errorDetail(error));
      setConfirmingWithdraw(false);
    }
  };

  let readOnlyNote = null;
  if (!enrollment.active) readOnlyNote = 'El alumno se retiró de esta etapa: la matrícula queda como historial.';
  else if (!editable) readOnlyNote = 'Esta matrícula es de un ciclo cerrado: queda como historial.';

  return (
    <FormFrame title="Matrícula" subtitle={name} onSubmit={handleSubmit(onSubmit)}>
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        <InfoRow label="Ciclo" value={enrollment.cycleName} />
        <InfoRow label="Etapa" value={enrollment.stageName} />
        {!editable && <InfoRow label="Carrera" value={careerLabel(enrollment)} />}
      </Box>

      {editable ? <CareerSelect register={register} careers={careers} /> : <Alert severity="info">{readOnlyNote}</Alert>}

      <TutorCard enrollment={enrollment} editable={editable} />

      {serverError && <Alert severity="error">{serverError}</Alert>}

      {editable ? (
        <Box sx={{ display: 'flex', gap: 1, pt: 0.5 }}>
          <Button
            variant="outlined"
            onClick={() => setConfirmingWithdraw(true)}
            disabled={isSubmitting}
            sx={{ flex: 1, height: 48, borderColor: '#C5CCD8', color: colors.danger }}
          >
            Retirar de la etapa
          </Button>
          <Button type="submit" variant="contained" disabled={isSubmitting} sx={{ flex: 1, height: 48 }}>
            Guardar
          </Button>
        </Box>
      ) : (
        <Button variant="outlined" onClick={onClose} sx={{ height: 48 }}>
          Cerrar
        </Button>
      )}

      {confirmingWithdraw && (
        <ConfirmDialog
          title="¿Retirar de la etapa?"
          message={`${name} dejará de estar matriculado en ${enrollment.stageName} (${enrollment.cycleName}). Su ficha y su historial en otras etapas no cambian.`}
          confirmLabel="Retirar"
          danger
          loading={withdrawing}
          onConfirm={confirmWithdraw}
          onCancel={() => setConfirmingWithdraw(false)}
        />
      )}
    </FormFrame>
  );
}
