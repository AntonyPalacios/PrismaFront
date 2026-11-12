import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { errorDetail } from '../../app/api/errors';
import { useNotify } from '../../app/notifyContext';
import { colors } from '../../app/theme';
import ResponsiveSheet from '../../layout/ResponsiveSheet';
import { useCreateStageMutation, useUpdateStageMutation } from '../api/stagesApi';
import { cycleDates } from '../cycleDisplay';
import { stageSchema, toStageBody } from './stageSchema';

/**
 * Create (stage = null) or edit a stage of the given cycle: Nombre *,
 * Fecha de inicio *, Fecha de fin. Bottom sheet on mobile, dialog on
 * desktop. When editing, "Eliminar etapa" lives at the bottom and hands
 * over to the parent (onDelete), which owns the confirmation.
 */
export default function StageForm({ cycle, stage, onClose, onDelete }) {
  return (
    <ResponsiveSheet onClose={onClose}>
      <StageFormContent cycle={cycle} stage={stage} onClose={onClose} onDelete={onDelete} />
    </ResponsiveSheet>
  );
}

function StageFormContent({ cycle, stage, onClose, onDelete }) {
  const isEdit = Boolean(stage);
  const notify = useNotify();
  const [serverError, setServerError] = useState(null);
  const [createStage] = useCreateStageMutation();
  const [updateStage] = useUpdateStageMutation();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(stageSchema),
    defaultValues: {
      name: stage?.name ?? '',
      startDate: stage?.startDate ?? '',
      endDate: stage?.endDate ?? '',
    },
  });

  const onSubmit = async (values) => {
    setServerError(null);
    try {
      if (isEdit) {
        await updateStage({ cycleId: cycle.id, id: stage.id, ...toStageBody(values) }).unwrap();
        notify('Etapa actualizada.');
      } else {
        await createStage({ cycleId: cycle.id, ...toStageBody(values) }).unwrap();
        notify('Etapa creada.');
      }
      onClose();
    } catch (error) {
      setServerError(errorDetail(error)); // e.g. 409 dates outside the cycle: keep what was typed
    }
  };

  // keeps the label above the field: a date input always shows its dd/mm/aaaa hint
  const dateProps = { type: 'date', slotProps: { inputLabel: { shrink: true } } };

  return (
    <Box
      component="form"
      noValidate
      onSubmit={handleSubmit(onSubmit)}
      aria-label={isEdit ? `Editar ${stage.name}` : 'Nueva etapa'}
      sx={{ display: 'flex', flexDirection: 'column', gap: 1.75, p: { xs: '12px 20px 24px', md: 3 }, overflowY: 'auto' }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        <Typography component="h2" sx={{ fontSize: 18, fontWeight: 500 }}>
          {isEdit ? 'Editar etapa' : 'Nueva etapa'}
        </Typography>
        <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
          Sus fechas deben estar dentro del ciclo {cycle.name} ({cycleDates(cycle)}).
        </Typography>
      </Box>

      <TextField
        label="Nombre"
        required
        autoFocus={!isEdit}
        placeholder="Ej. Etapa 1 · Nivelación"
        {...register('name')}
        error={Boolean(errors.name)}
        helperText={errors.name?.message}
      />
      <TextField
        label="Fecha de inicio"
        required
        {...dateProps}
        {...register('startDate')}
        error={Boolean(errors.startDate)}
        helperText={errors.startDate?.message}
      />
      <TextField
        label="Fecha de fin"
        {...dateProps}
        {...register('endDate')}
        error={Boolean(errors.endDate)}
        helperText={errors.endDate?.message ?? 'Opcional. Puedes definirla más adelante.'}
      />

      {serverError && <Alert severity="error">{serverError}</Alert>}

      <Box sx={{ display: 'flex', gap: 1, pt: 0.5 }}>
        <Button variant="outlined" onClick={onClose} disabled={isSubmitting} sx={{ flex: 1, height: 48 }}>
          Cancelar
        </Button>
        <Button type="submit" variant="contained" color="secondary" disabled={isSubmitting} sx={{ flex: 1, height: 48 }}>
          {isEdit ? 'Guardar' : 'Crear etapa'}
        </Button>
      </Box>

      {isEdit && (
        <Button onClick={onDelete} disabled={isSubmitting} sx={{ alignSelf: 'center', color: colors.danger }}>
          Eliminar etapa
        </Button>
      )}
    </Box>
  );
}
