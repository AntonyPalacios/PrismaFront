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
import { useCreateUserMutation } from '../api/usersApi';
import UserFields from './UserFields';
import { createUserSchema, toUserBody } from './userSchema';

/** "Nuevo usuario": bottom sheet on mobile, dialog on desktop. */
export default function CreateUserForm({ onClose }) {
  return (
    <ResponsiveSheet onClose={onClose}>
      <CreateUserFormContent onClose={onClose} />
    </ResponsiveSheet>
  );
}

function CreateUserFormContent({ onClose }) {
  const notify = useNotify();
  const [serverError, setServerError] = useState(null);
  const [createUser] = useCreateUserMutation();
  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(createUserSchema),
    defaultValues: { email: '', firstName: '', lastNamePat: '', lastNameMat: '', roles: [] },
  });

  const onSubmit = async (values) => {
    setServerError(null);
    try {
      await createUser(toUserBody(values)).unwrap();
      notify('Usuario creado. Ya puede entrar con su cuenta de Google.');
      onClose();
    } catch (error) {
      setServerError(errorDetail(error)); // e.g. 409 duplicate email: keep what was typed
    }
  };

  return (
    <Box
      component="form"
      noValidate
      onSubmit={handleSubmit(onSubmit)}
      aria-label="Nuevo usuario"
      sx={{ display: 'flex', flexDirection: 'column', gap: 1.75, p: { xs: '12px 20px 24px', md: 3 }, overflowY: 'auto' }}
    >
      <Typography component="h2" sx={{ fontSize: 18, fontWeight: 500 }}>
        Nuevo usuario
      </Typography>

      <UserFields register={register} control={control} errors={errors} />

      {serverError && <Alert severity="error">{serverError}</Alert>}

      <Box sx={{ display: 'flex', gap: 1, pt: 0.5 }}>
        <Button variant="outlined" onClick={onClose} disabled={isSubmitting} sx={{ flex: 1, height: 48 }}>
          Cancelar
        </Button>
        <Button type="submit" variant="contained" color="secondary" disabled={isSubmitting} sx={{ flex: 1, height: 48 }}>
          Crear usuario
        </Button>
      </Box>
    </Box>
  );
}
