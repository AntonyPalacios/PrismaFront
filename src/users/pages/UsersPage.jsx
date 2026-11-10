import { useState } from 'react';
import { useNavigate } from 'react-router';
import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ButtonBase from '@mui/material/ButtonBase';
import CircularProgress from '@mui/material/CircularProgress';
import Fab from '@mui/material/Fab';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import { errorDetail } from '../../app/api/errors';
import { colors } from '../../app/theme';
import { useGetUsersQuery } from '../api/usersApi';
import CreateUserForm from '../components/CreateUserForm';
import { STATUS, userFullName, userInitials } from '../userDisplay';

/**
 * "Usuarios" (Claude Design: UsersMobile). Cards on mobile, a table on
 * desktop; the backend sorts by last names. Inactive users only appear
 * with "Mostrar inactivos". A row opens the user's detail.
 */
export default function UsersPage() {
  const navigate = useNavigate();
  const [includeInactive, setIncludeInactive] = useState(false);
  const [creating, setCreating] = useState(false);
  const { data: users = [], isLoading, error } = useGetUsersQuery({ includeInactive });
  const activeCount = users.filter((u) => u.active).length;
  const open = (user) => navigate(`/users/${user.id}`);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 1080, pb: { xs: 10, md: 0 } }}>
      <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'flex-end', justifyContent: 'space-between', gap: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <Typography component="h1" sx={{ fontSize: 28, fontWeight: 500 }}>
            Usuarios
          </Typography>
          <Typography sx={{ fontSize: 14, color: 'text.secondary' }}>Quiénes pueden entrar a Prisma y con qué rol.</Typography>
        </Box>
        <Button variant="contained" color="secondary" startIcon={<AddIcon />} onClick={() => setCreating(true)}>
          Nuevo usuario
        </Button>
      </Box>

      <Box
        sx={{
          // mobile: full-bleed white strip under the app bar, as in the prototype
          mx: { xs: -2, md: 0 },
          mt: { xs: -2, md: 0 },
          px: 2,
          py: 0.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1,
          bgcolor: 'background.paper',
          borderBottom: 1,
          borderColor: 'divider',
          borderRadius: { md: '12px' },
          border: { md: 1 },
        }}
      >
        <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
          {isLoading ? 'Cargando…' : `${activeCount} ${activeCount === 1 ? 'activo' : 'activos'} · A–Z por apellido`}
        </Typography>
        <FormControlLabel
          labelPlacement="start"
          control={<Switch size="small" checked={includeInactive} onChange={(e) => setIncludeInactive(e.target.checked)} />}
          label="Mostrar inactivos"
          slotProps={{ typography: { sx: { fontSize: 13 } } }}
        />
      </Box>

      {isLoading && (
        <Box role="status" sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress size={32} aria-label="Cargando usuarios" />
        </Box>
      )}

      {!isLoading && error && <Alert severity="error">{errorDetail(error)}</Alert>}

      {!isLoading && !error && users.length === 0 && (
        <Typography sx={{ py: 4, textAlign: 'center', color: 'text.secondary' }}>No hay usuarios para mostrar.</Typography>
      )}

      {!isLoading && !error && users.length > 0 && (
        <>
          {/* mobile */}
          <Box
            component="ul"
            sx={{ display: { xs: 'flex', md: 'none' }, listStyle: 'none', m: 0, p: 0, flexDirection: 'column', gap: 1 }}
          >
            {users.map((user) => (
              <Box component="li" key={user.id}>
                <UserCard user={user} onOpen={() => open(user)} />
              </Box>
            ))}
          </Box>

          {/* desktop */}
          <Box
            sx={{
              display: { xs: 'none', md: 'block' },
              bgcolor: 'background.paper',
              border: 1,
              borderColor: 'divider',
              borderRadius: '16px',
              overflowX: 'auto',
            }}
          >
            <Table aria-label="Usuarios">
              <TableHead>
                <TableRow>
                  <TableCell>Nombre</TableCell>
                  <TableCell>Correo</TableCell>
                  <TableCell>Roles</TableCell>
                  <TableCell>Estado</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id} hover onClick={() => open(user)} sx={{ cursor: 'pointer' }}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <UserAvatar user={user} size={32} />
                        <ButtonBase
                          onClick={(e) => {
                            e.stopPropagation();
                            open(user);
                          }}
                          sx={{ fontSize: 14, fontWeight: 500, color: user.active ? 'text.primary' : 'text.secondary' }}
                        >
                          {userFullName(user)}
                        </ButtonBase>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ color: 'text.secondary' }}>{user.email}</TableCell>
                    <TableCell>
                      <RoleChips roles={user.roles} />
                    </TableCell>
                    <TableCell>
                      <StatusChip active={user.active} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        </>
      )}

      <Fab
        variant="extended"
        color="secondary"
        onClick={() => setCreating(true)}
        sx={{
          display: { md: 'none' },
          position: 'fixed',
          right: 16,
          bottom: 24,
          height: 56,
          borderRadius: '16px',
          px: 2.5,
          textTransform: 'none',
          fontSize: 15,
          boxShadow: '0 6px 16px rgba(0,47,108,0.3)',
        }}
      >
        <AddIcon sx={{ mr: 1 }} />
        Nuevo usuario
      </Fab>

      {creating && <CreateUserForm onClose={() => setCreating(false)} />}
    </Box>
  );
}

function UserCard({ user, onOpen }) {
  return (
    <ButtonBase
      onClick={onOpen}
      aria-label={`Ver ${userFullName(user)}`}
      sx={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        px: 1.75,
        py: 1.5,
        bgcolor: 'background.paper',
        border: 1,
        borderColor: 'divider',
        borderRadius: '14px',
        textAlign: 'left',
        '&:hover': { borderColor: colors.secondary },
      }}
    >
      <UserAvatar user={user} size={40} />
      <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        <Typography sx={{ fontSize: 15, fontWeight: 500, color: user.active ? 'text.primary' : 'text.secondary' }}>
          {userFullName(user)}
        </Typography>
        <Typography noWrap sx={{ fontSize: 12, color: 'text.secondary' }}>
          {user.email}
        </Typography>
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
          <RoleChips roles={user.roles} />
          {!user.active && <StatusChip active={false} />}
        </Box>
      </Box>
    </ButtonBase>
  );
}

export function UserAvatar({ user, size }) {
  return (
    <Avatar
      src={user.photoUrl ?? undefined}
      alt=""
      slotProps={{ img: { referrerPolicy: 'no-referrer' } }}
      sx={{ width: size, height: size, bgcolor: user.active ? colors.secondary : '#8C96A8', fontSize: size * 0.36, fontWeight: 500 }}
    >
      {userInitials(user)}
    </Avatar>
  );
}

function RoleChips({ roles }) {
  return (
    <Box component="span" sx={{ display: 'inline-flex', gap: 0.5, flexWrap: 'wrap' }}>
      {roles.map((role) => (
        <Box
          component="span"
          key={role}
          sx={{ fontSize: 11, fontWeight: 500, px: 1, py: 0.375, borderRadius: '10px', bgcolor: colors.selected, color: colors.primary }}
        >
          {role}
        </Box>
      ))}
    </Box>
  );
}

export function StatusChip({ active }) {
  const status = active ? STATUS.active : STATUS.inactive;
  return (
    <Box
      component="span"
      sx={{ fontSize: 12, fontWeight: 500, px: 1.25, py: 0.375, borderRadius: '12px', bgcolor: status.bg, color: status.fg }}
    >
      {status.label}
    </Box>
  );
}
