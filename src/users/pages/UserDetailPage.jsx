import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link as RouterLink, useParams } from 'react-router';
import { zodResolver } from '@hookform/resolvers/zod';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import { errorDetail } from '../../app/api/errors';
import { useNotify } from '../../app/notifyContext';
import { colors } from '../../app/theme';
import ConfirmDialog from '../../layout/ConfirmDialog';
import {
  useDeactivateUserMutation,
  useGetUserQuery,
  useReactivateUserMutation,
  useUpdateUserMutation,
} from '../api/usersApi';
import UserFields from '../components/UserFields';
import { toUserBody, updateUserSchema } from '../components/userSchema';
import { userFullName } from '../userDisplay';
import { StatusChip, UserAvatar } from './UsersPage';

const actionSx = { height: 44, px: 2.25, borderRadius: 999, borderColor: '#C5CCD8', bgcolor: 'background.paper' };

/**
 * A user's detail (Claude Design: UsersDesktop). The "Datos" card is
 * read-only until "Editar". Deactivate (confirmed) and reactivate are
 * separate actions, never part of the form; only one of them shows.
 */
export default function UserDetailPage() {
  const { id } = useParams();
  const { data: user, isLoading, error } = useGetUserQuery(id);

  if (isLoading) {
    return (
      <Box role="status" sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <CircularProgress size={32} aria-label="Cargando usuario" />
      </Box>
    );
  }
  if (error) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <BackLink />
        <Alert severity="error">{errorDetail(error)}</Alert>
      </Box>
    );
  }
  // key: a fresh form whenever the server copy changes (after saving, reactivating…)
  return <UserDetail key={JSON.stringify(user)} user={user} />;
}

function BackLink() {
  return (
    <Link component={RouterLink} to="/users" underline="none" sx={{ fontSize: 13, alignSelf: 'flex-start', py: 0.5 }}>
      ‹ Usuarios
    </Link>
  );
}

function UserDetail({ user }) {
  const notify = useNotify();
  const [editing, setEditing] = useState(false);
  const [serverError, setServerError] = useState(null);
  const [confirmingDeactivate, setConfirmingDeactivate] = useState(false);
  const [updateUser] = useUpdateUserMutation();
  const [deactivateUser, { isLoading: deactivating }] = useDeactivateUserMutation();
  const [reactivateUser, { isLoading: reactivating }] = useReactivateUserMutation();
  const name = userFullName(user);

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      firstName: user.firstName,
      lastNamePat: user.lastNamePat,
      lastNameMat: user.lastNameMat ?? '',
      roles: user.roles,
    },
  });

  const cancelEdit = () => {
    reset();
    setServerError(null);
    setEditing(false);
  };

  const onSubmit = async (values) => {
    setServerError(null);
    try {
      await updateUser({ id: user.id, ...toUserBody(values) }).unwrap();
      notify('Usuario actualizado.');
      setEditing(false);
    } catch (error) {
      setServerError(errorDetail(error)); // keep the form open with what was typed
    }
  };

  const confirmDeactivate = async () => {
    try {
      await deactivateUser(user.id).unwrap();
      notify('Usuario desactivado.');
    } catch (error) {
      notify(errorDetail(error), 'error');
    } finally {
      setConfirmingDeactivate(false);
    }
  };

  const reactivate = async () => {
    try {
      await reactivateUser(user.id).unwrap();
      notify('Usuario reactivado.');
    } catch (error) {
      notify(errorDetail(error), 'error');
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, maxWidth: 760 }}>
      <BackLink />

      <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2 }}>
        <UserAvatar user={user} size={56} />
        <Box sx={{ flex: '1 1 240px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 0.75 }}>
          <Typography component="h1" sx={{ fontSize: { xs: 22, md: 26 }, fontWeight: 500 }}>
            {name}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1, fontSize: 14, color: 'text.secondary' }}>
            <StatusChip active={user.active} />
            <Box component="span" sx={{ overflowWrap: 'anywhere' }}>
              {user.email}
            </Box>
          </Box>
        </Box>
        {user.active ? (
          <Box sx={{ display: 'flex', gap: 1 }}>
            {!editing && (
              <Button variant="outlined" onClick={() => setEditing(true)} sx={{ ...actionSx, color: colors.primary }}>
                Editar
              </Button>
            )}
            {!user.permanentAdmin && (
              <Button
                variant="outlined"
                onClick={() => setConfirmingDeactivate(true)}
                disabled={editing}
                sx={{ ...actionSx, color: colors.danger }}
              >
                Desactivar
              </Button>
            )}
          </Box>
        ) : (
          <Button
            variant="outlined"
            onClick={reactivate}
            disabled={reactivating}
            sx={{ ...actionSx, color: colors.primary }}
          >
            Reactivar
          </Button>
        )}
      </Box>

      <Box
        component="form"
        noValidate
        onSubmit={handleSubmit(onSubmit)}
        aria-labelledby="user-data-title"
        sx={{
          bgcolor: 'background.paper',
          border: 1,
          borderColor: 'divider',
          borderRadius: '16px',
          p: 2.5,
          display: 'flex',
          flexDirection: 'column',
          gap: 1.75,
        }}
      >
        <Typography id="user-data-title" component="h2" sx={{ fontSize: 16, fontWeight: 500 }}>
          Datos
        </Typography>

        <UserFields
          register={register}
          control={control}
          errors={errors}
          disabled={!editing}
          email={user.email}
          lockAdmin={user.permanentAdmin}
        />

        {serverError && <Alert severity="error">{serverError}</Alert>}

        {editing && (
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
            <Button variant="outlined" onClick={cancelEdit} disabled={isSubmitting} sx={{ minWidth: 120, height: 44 }}>
              Cancelar
            </Button>
            <Button type="submit" variant="contained" color="secondary" disabled={isSubmitting} sx={{ minWidth: 120, height: 44 }}>
              Guardar
            </Button>
          </Box>
        )}
      </Box>

      {!user.active && (
        <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
          Este usuario está inactivo: no puede entrar a Prisma. Todo lo que creó o modificó sigue intacto.
        </Typography>
      )}

      {confirmingDeactivate && (
        <ConfirmDialog
          title="¿Desactivar usuario?"
          message={`${name} perderá acceso a Prisma de inmediato, pero todo lo que creó o modificó permanece intacto. Podrás reactivarlo cuando quieras.`}
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
