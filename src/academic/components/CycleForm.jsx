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
import ResponsiveSheet from '../../layout/ResponsiveSheet';
import { useCreateCycleMutation, useUpdateCycleMutation } from '../api/cyclesApi';
import { cycleSchema, toCycleBody } from './cycleSchema';

/**
 * Create (cycle = null) or edit a cycle: Nombre *, Fecha de inicio *,
 * Fecha de fin. Bottom sheet on mobile, dialog on desktop. There is no
 * delete action here: "Eliminar ciclo" lives in the cycle detail.
 */
export default function CycleForm({ cycle, onClose }) {
  return (
    <ResponsiveSheet onClose={onClose}>
      <CycleFormContent cycle={cycle} onClose={onClose} />
    </ResponsiveSheet>
  );
}

function CycleFormContent({ cycle, onClose }) {
  const isEdit = Boolean(cycle);
  const notify = useNotify();
  const [serverError, setServerError] = useState(null);
  const [createCycle] = useCreateCycleMutation();
  const [updateCycle] = useUpdateCycleMutation();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(cycleSchema),
    defaultValues: {
      name: cycle?.name ?? '',
      startDate: cycle?.startDate ?? '',
      endDate: cycle?.endDate ?? '',
    },
  });

  const onSubmit = async (values) => {
    setServerError(null);
    try {
      if (isEdit) {
        await updateCycle({ id: cycle.id, ...toCycleBody(values) }).unwrap();
        notify('Ciclo actualizado.');
      } else {
        await createCycle(toCycleBody(values)).unwrap();
        notify('Ciclo creado.');
      }
      onClose();
    } catch (error) {
      setServerError(errorDetail(error)); // e.g. 409 overlapping dates: keep what was typed
    }
  };

  // keeps the label above the field: a date input always shows its dd/mm/aaaa hint
  const dateProps = { type: 'date', slotProps: { inputLabel: { shrink: true } } };

  return (
    <Box
      component="form"
      noValidate
      onSubmit={handleSubmit(onSubmit)}
      aria-label={isEdit ? `Editar ${cycle.name}` : 'Nuevo ciclo'}
      sx={{ display: 'flex', flexDirection: 'column', gap: 1.75, p: { xs: '12px 20px 24px', md: 3 }, overflowY: 'auto' }}
    >
      <Typography component="h2" sx={{ fontSize: 18, fontWeight: 500 }}>
        {isEdit ? 'Editar ciclo' : 'Nuevo ciclo'}
      </Typography>

      <TextField
        label="Nombre"
        required
        autoFocus={!isEdit}
        placeholder="Ej. 2026-II"
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
          {isEdit ? 'Guardar' : 'Crear ciclo'}
        </Button>
      </Box>
    </Box>
  );
}
