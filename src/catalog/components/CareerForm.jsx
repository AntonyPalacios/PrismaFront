import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { errorDetail } from '../../app/api/errors';
import { colors } from '../../app/theme';
import { useNotify } from '../../app/notifyContext';
import ConfirmDialog from '../../layout/ConfirmDialog';
import ResponsiveSheet from '../../layout/ResponsiveSheet';
import { useCreateCareerMutation, useDeactivateCareerMutation, useUpdateCareerMutation } from '../api/careersApi';
import { useGetExamTypesQuery } from '../api/examTypesApi';
import { careerSchema } from './careerSchema';

/**
 * Create (career = null) or edit a career, as in the prototype's
 * CareersMobile form: Nombre *, Abreviatura, Tipo de examen *. When editing,
 * "Desactivar" (with confirmation) lives at the bottom of the form.
 */
export default function CareerForm({ career, onClose }) {
  return (
    <ResponsiveSheet onClose={onClose}>
      <CareerFormContent career={career} onClose={onClose} />
    </ResponsiveSheet>
  );
}

function CareerFormContent({ career, onClose }) {
  const isEdit = Boolean(career);
  const notify = useNotify();
  const [serverError, setServerError] = useState(null);
  const [confirmingDeactivate, setConfirmingDeactivate] = useState(false);
  const { data: examTypes = [], isLoading: loadingExamTypes } = useGetExamTypesQuery();
  const [createCareer] = useCreateCareerMutation();
  const [updateCareer] = useUpdateCareerMutation();
  const [deactivateCareer, { isLoading: deactivating }] = useDeactivateCareerMutation();

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(careerSchema),
    defaultValues: {
      name: career?.name ?? '',
      abbreviation: career?.abbreviation ?? '',
      examTypeId: career?.examTypeId ?? '',
    },
  });

  const onSubmit = async (values) => {
    setServerError(null);
    const body = { ...values, abbreviation: values.abbreviation || null };
    try {
      if (isEdit) {
        await updateCareer({ id: career.id, ...body }).unwrap();
        notify('Carrera actualizada.');
      } else {
        await createCareer(body).unwrap();
        notify('Carrera creada.');
      }
      onClose();
    } catch (error) {
      setServerError(errorDetail(error)); // e.g. 409 duplicate name: keep what was typed
    }
  };

  const confirmDeactivate = async () => {
    try {
      await deactivateCareer(career.id).unwrap();
      notify('Carrera desactivada.');
      onClose();
    } catch (error) {
      setConfirmingDeactivate(false);
      setServerError(errorDetail(error));
    }
  };

  return (
    <Box
      component="form"
      noValidate
      onSubmit={handleSubmit(onSubmit)}
      aria-label={isEdit ? `Editar ${career.name}` : 'Nueva carrera'}
      sx={{ display: 'flex', flexDirection: 'column', gap: 1.75, p: { xs: '12px 20px 24px', md: 3 }, overflowY: 'auto' }}
    >
      <Typography component="h2" sx={{ fontSize: 18, fontWeight: 500 }}>
        {isEdit ? 'Editar carrera' : 'Nueva carrera'}
      </Typography>

      <TextField
        label="Nombre"
        required
        autoFocus={!isEdit}
        {...register('name')}
        error={Boolean(errors.name)}
        helperText={errors.name?.message}
      />
      <TextField
        label="Abreviatura"
        {...register('abbreviation')}
        error={Boolean(errors.abbreviation)}
        helperText={errors.abbreviation?.message}
      />
      <Controller
        name="examTypeId"
        control={control}
        render={({ field }) => (
          <TextField
            select
            label="Tipo de examen"
            required
            // until the options arrive, MUI would warn about an out-of-range value
            value={examTypes.length ? field.value : ''}
            onChange={(e) => field.onChange(e.target.value === '' ? '' : Number(e.target.value))}
            onBlur={field.onBlur}
            inputRef={field.ref}
            disabled={loadingExamTypes}
            error={Boolean(errors.examTypeId)}
            helperText={errors.examTypeId?.message}
          >
            {examTypes.map((examType) => (
              <MenuItem key={examType.id} value={examType.id}>
                {examType.name}
              </MenuItem>
            ))}
          </TextField>
        )}
      />

      {serverError && <Alert severity="error">{serverError}</Alert>}

      <Box sx={{ display: 'flex', gap: 1, pt: 0.5 }}>
        <Button variant="outlined" onClick={onClose} disabled={isSubmitting} sx={{ flex: 1, height: 48 }}>
          Cancelar
        </Button>
        <Button type="submit" variant="contained" color="secondary" disabled={isSubmitting} sx={{ flex: 1, height: 48 }}>
          {isEdit ? 'Guardar' : 'Crear carrera'}
        </Button>
      </Box>

      {isEdit && (
        <Button
          onClick={() => setConfirmingDeactivate(true)}
          disabled={isSubmitting}
          sx={{ alignSelf: 'center', color: colors.danger }}
        >
          Desactivar carrera
        </Button>
      )}

      {confirmingDeactivate && (
        <ConfirmDialog
          title="¿Desactivar carrera?"
          message={`"${career.name}" quedará como inactiva y no se podrá elegir para nuevas matrículas. Podrás reactivarla cuando quieras.`}
          confirmLabel="Desactivar"
          danger
          loading={deactivating}
          onConfirm={confirmDeactivate}
          onCancel={() => setConfirmingDeactivate(false)}
        />
      )}
    </Box>
  );
}
