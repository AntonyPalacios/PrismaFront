import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import Drawer from '@mui/material/Drawer';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { errorDetail } from '../../app/api/errors';
import { useNotify } from '../../app/notifyContext';
import { groupCoursesByArea, useGetAreasQuery, useGetCoursesQuery } from '../api/catalogApi';
import { useCreateExamTypeMutation, useUpdateExamTypeMutation } from '../api/examTypesApi';
import { examTypeSchema } from './examTypeSchema';

/**
 * Create (examType = null) or edit an exam type: name + the full set of
 * courses it evaluates, saved in one request. Bottom sheet on mobile (like
 * the prototype's "Nueva carrera"), dialog on desktop.
 */
export default function ExamTypeForm({ examType, onClose }) {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const content = <ExamTypeFormContent examType={examType} onClose={onClose} />;

  if (isDesktop) {
    return (
      <Dialog open onClose={onClose} fullWidth maxWidth="sm" slotProps={{ paper: { sx: { borderRadius: '20px' } } }}>
        {content}
      </Dialog>
    );
  }
  return (
    <Drawer
      anchor="bottom"
      open
      onClose={onClose}
      slotProps={{ paper: { sx: { borderRadius: '24px 24px 0 0', maxHeight: '92dvh' } } }}
    >
      <Box aria-hidden="true" sx={{ width: 36, height: 4, borderRadius: 2, bgcolor: '#C5CCD8', mx: 'auto', mt: 1.25 }} />
      {content}
    </Drawer>
  );
}

function ExamTypeFormContent({ examType, onClose }) {
  const isEdit = Boolean(examType);
  const notify = useNotify();
  const [serverError, setServerError] = useState(null);
  const areas = useGetAreasQuery();
  const courses = useGetCoursesQuery();
  const [createExamType] = useCreateExamTypeMutation();
  const [updateExamType] = useUpdateExamTypeMutation();

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(examTypeSchema),
    defaultValues: { name: examType?.name ?? '', courseIds: examType?.courseIds ?? [] },
  });

  const onSubmit = async (values) => {
    setServerError(null);
    try {
      if (isEdit) {
        await updateExamType({ id: examType.id, ...values }).unwrap();
        notify('Tipo de examen actualizado.');
      } else {
        await createExamType(values).unwrap();
        notify('Tipo de examen creado.');
      }
      onClose();
    } catch (error) {
      // keep the form open with what was typed (e.g. 409 duplicate name)
      setServerError(errorDetail(error));
    }
  };

  const groups = groupCoursesByArea(areas.data, courses.data);
  const loadingCourses = areas.isLoading || courses.isLoading;

  return (
    <Box
      component="form"
      noValidate
      onSubmit={handleSubmit(onSubmit)}
      aria-label={isEdit ? `Editar ${examType.name}` : 'Nuevo tipo de examen'}
      sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: { xs: '12px 20px 24px', md: 3 }, overflowY: 'auto' }}
    >
      <Typography component="h2" sx={{ fontSize: 18, fontWeight: 500 }}>
        {isEdit ? 'Editar tipo de examen' : 'Nuevo tipo de examen'}
      </Typography>

      <TextField
        label="Nombre"
        required
        autoFocus={!isEdit}
        {...register('name')}
        error={Boolean(errors.name)}
        helperText={errors.name?.message}
        slotProps={{ htmlInput: { maxLength: 60 } }}
      />

      {/* a plain group, not <fieldset>: fieldset + flex doesn't measure its content
          and the buttons ended up drawn over the checkboxes */}
      <Box
        role="group"
        aria-labelledby="exam-type-courses-label"
        sx={{ flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 1 }}
      >
        <Typography id="exam-type-courses-label" sx={{ fontSize: 14, fontWeight: 500, mb: 0.5 }}>
          Cursos que evalúa *
        </Typography>
        {loadingCourses && <CircularProgress size={24} aria-label="Cargando cursos" />}
        {(areas.error || courses.error) && <Alert severity="error">{errorDetail(areas.error ?? courses.error)}</Alert>}
        <Controller
          name="courseIds"
          control={control}
          render={({ field }) => {
            const toggle = (id) =>
              field.onChange(field.value.includes(id) ? field.value.filter((v) => v !== id) : [...field.value, id]);
            return (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {groups.map((area) => (
                  <Box key={area.id} role="group" aria-label={area.name}>
                    <Typography sx={{ fontSize: 12, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.6 }}>
                      {area.name}
                    </Typography>
                    {area.courses.map((course) => (
                      <FormControlLabel
                        key={course.id}
                        sx={{ display: 'flex', ml: 0 }}
                        control={
                          <Checkbox checked={field.value.includes(course.id)} onChange={() => toggle(course.id)} />
                        }
                        label={course.displayLabel ?? course.name}
                      />
                    ))}
                  </Box>
                ))}
              </Box>
            );
          }}
        />
        {errors.courseIds && <FormHelperText error>{errors.courseIds.message}</FormHelperText>}
      </Box>

      {serverError && <Alert severity="error">{serverError}</Alert>}

      <Box sx={{ display: 'flex', gap: 1, pt: 0.5 }}>
        <Button variant="outlined" onClick={onClose} disabled={isSubmitting} sx={{ flex: 1, height: 48 }}>
          Cancelar
        </Button>
        <Button type="submit" variant="contained" color="secondary" disabled={isSubmitting} sx={{ flex: 1, height: 48 }}>
          {isEdit ? 'Guardar' : 'Crear tipo de examen'}
        </Button>
      </Box>
    </Box>
  );
}
