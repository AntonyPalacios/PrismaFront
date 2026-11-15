import { useState } from 'react';
import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { errorDetail } from '../../app/api/errors';
import { useNotify } from '../../app/notifyContext';
import { colors } from '../../app/theme';
import { useIsAdmin } from '../../users/api/authApi';
import { useGetUsersQuery } from '../../users/api/usersApi';
import { useAssignTutorMutation, useGetTutorAssignmentsQuery } from '../api/tutorAssignmentsApi';
import { assignmentRange, formatLongDay } from '../tutorDisplay';

/**
 * "Tutor" and "Historial de tutores" of an enrollment (Claude Design:
 * EnrollmentTutorMobile). Everyone who sees enrollments sees them; only an
 * ADMIN gets the "Nuevo tutor" selector (active tutors, A–Z by surname) and
 * "Asignar" / "Reasignar tutor", and only while the enrollment is editable.
 * No <form> here: it lives inside the enrollment's own form.
 */
export default function TutorCard({ enrollment, editable }) {
  const isAdmin = useIsAdmin();
  const { data: history = [], isLoading, error } = useGetTutorAssignmentsQuery(enrollment.id);
  const current = history.find((assignment) => !assignment.validTo);

  return (
    <Box
      component="section"
      aria-labelledby="enrollment-tutor-title"
      sx={{ border: 1, borderColor: 'divider', borderRadius: '16px', p: 2, display: 'flex', flexDirection: 'column', gap: 1.25 }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
        <Typography id="enrollment-tutor-title" component="h3" sx={{ fontSize: 16, fontWeight: 500 }}>
          Tutor
        </Typography>
        {isAdmin && editable && (
          <Box component="span" sx={{ fontSize: 11, fontWeight: 500, px: 1, py: 0.375, borderRadius: '10px', bgcolor: '#ECEFF3', color: '#4A5160' }}>
            Solo admin
          </Box>
        )}
      </Box>

      {isLoading && <CircularProgress size={20} aria-label="Cargando tutor" />}
      {!isLoading && error && <Alert severity="error">{errorDetail(error)}</Alert>}
      {!isLoading && !error && (
        <>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 1.5, py: 1.25, borderRadius: '12px', bgcolor: '#F4F6FA' }}>
            {current ? (
              <>
                <Avatar alt="" sx={{ width: 36, height: 36, bgcolor: colors.secondary, fontSize: 13, fontWeight: 500 }}>
                  {initials(current.tutorName)}
                </Avatar>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
                  <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>Vigente desde {formatLongDay(current.validFrom)}</Typography>
                  <Typography sx={{ fontSize: 15, fontWeight: 500 }}>{current.tutorName}</Typography>
                </Box>
              </>
            ) : (
              <Typography sx={{ fontSize: 14, color: 'text.secondary' }}>Sin tutor asignado</Typography>
            )}
          </Box>

          {isAdmin && editable && <AssignTutor enrollment={enrollment} current={current} />}

          {history.length > 0 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75, pt: 0.5 }}>
              <Typography component="h4" sx={{ fontSize: 14, fontWeight: 500 }}>
                Historial de tutores
              </Typography>
              <Box component="ul" aria-label="Historial de tutores" sx={{ listStyle: 'none', m: 0, p: 0, display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                {history.map((assignment) => (
                  <Box component="li" key={assignment.id} sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, fontSize: 14 }}>
                    <Box component="span" sx={{ fontWeight: assignment.validTo ? 400 : 500 }}>
                      {assignment.tutorName}
                    </Box>
                    <Box component="span" sx={{ color: assignment.validTo ? 'text.secondary' : '#2F5A08', fontWeight: assignment.validTo ? 400 : 500, whiteSpace: 'nowrap' }}>
                      {assignmentRange(assignment)}
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          )}
        </>
      )}
    </Box>
  );
}

function AssignTutor({ enrollment, current }) {
  const notify = useNotify();
  const [tutorId, setTutorId] = useState('');
  const [serverError, setServerError] = useState(null);
  const { data: users = [] } = useGetUsersQuery();
  const [assignTutor, { isLoading }] = useAssignTutorMutation();
  // active users with the TUTOR role, already A–Z by surname (backend); not the current one
  const tutors = users.filter((u) => u.active && u.roles.includes('TUTOR') && u.id !== current?.tutorId);

  const assign = async () => {
    setServerError(null);
    try {
      await assignTutor({ enrollmentId: enrollment.id, tutorUserId: Number(tutorId) }).unwrap();
      notify(current ? 'Tutor reasignado.' : 'Tutor asignado.');
      setTutorId('');
    } catch (error) {
      setServerError(errorDetail(error));
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      <TextField
        select
        fullWidth
        label={current ? 'Nuevo tutor (A–Z por apellido)' : 'Tutor (A–Z por apellido)'}
        value={tutorId}
        onChange={(e) => setTutorId(e.target.value)}
        slotProps={{ select: { native: true }, inputLabel: { shrink: true } }}
      >
        <option value="">Elige un tutor…</option>
        {tutors.map((tutor) => (
          <option key={tutor.id} value={tutor.id}>
            {[tutor.lastNamePat, tutor.lastNameMat].filter(Boolean).join(' ')}, {tutor.firstName}
          </option>
        ))}
      </TextField>
      {serverError && <Alert severity="error">{serverError}</Alert>}
      <Button variant="contained" color="secondary" onClick={assign} disabled={!tutorId || isLoading} sx={{ height: 44, borderRadius: '22px' }}>
        {current ? 'Reasignar tutor' : 'Asignar tutor'}
      </Button>
    </Box>
  );
}

/** "Ríos Paredes, María" → "RM": first surname + first name, as the other avatars. */
function initials(name) {
  const [lastNames = '', firstNames = ''] = name.split(', ');
  return `${lastNames[0] ?? ''}${firstNames[0] ?? ''}`.toUpperCase();
}
