import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { errorDetail } from '../../app/api/errors';
import { useNotify } from '../../app/notifyContext';
import ResponsiveSheet from '../../layout/ResponsiveSheet';
import { useCreateStudentMutation } from '../api/studentsApi';
import StudentFields from './StudentFields';
import { EMPTY_STUDENT, studentSchema, toStudentBody } from './studentSchema';

/** "Nuevo alumno": bottom sheet on mobile, dialog on desktop. */
export default function CreateStudentForm({ onClose }) {
  return (
    <ResponsiveSheet onClose={onClose}>
      <CreateStudentFormContent onClose={onClose} />
    </ResponsiveSheet>
  );
}

function CreateStudentFormContent({ onClose }) {
  const notify = useNotify();
  const [serverError, setServerError] = useState(null);
  const [createStudent] = useCreateStudentMutation();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(studentSchema), defaultValues: EMPTY_STUDENT });

  const onSubmit = async (values) => {
    setServerError(null);
    try {
      await createStudent(toStudentBody(values)).unwrap();
      notify('Alumno registrado.');
      onClose();
    } catch (error) {
      setServerError(errorDetail(error)); // e.g. 409 duplicate DNI: keep what was typed
    }
  };

  return (
    <Box
      component="form"
      noValidate
      onSubmit={handleSubmit(onSubmit)}
      aria-label="Nuevo alumno"
      sx={{ display: 'flex', flexDirection: 'column', gap: 1.75, p: { xs: '12px 20px 24px', md: 3 }, overflowY: 'auto' }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        <Typography component="h2" sx={{ fontSize: 18, fontWeight: 500 }}>
          Nuevo alumno
        </Typography>
        <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
          Solo los nombres y el apellido paterno son obligatorios; lo demás se puede completar después.
        </Typography>
      </Box>

      <StudentFields register={register} errors={errors} autoFocus />

      {serverError && <Alert severity="error">{serverError}</Alert>}

      <Box sx={{ display: 'flex', gap: 1, pt: 0.5 }}>
        <Button variant="outlined" onClick={onClose} disabled={isSubmitting} sx={{ flex: 1, height: 48 }}>
          Cancelar
        </Button>
        <Button type="submit" variant="contained" color="secondary" disabled={isSubmitting} sx={{ flex: 1, height: 48 }}>
          Registrar alumno
        </Button>
      </Box>
    </Box>
  );
}
