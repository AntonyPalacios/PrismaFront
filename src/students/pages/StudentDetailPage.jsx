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
import { useIsAdmin } from '../../users/api/authApi';
import {
  useDeactivateStudentMutation,
  useGetStudentQuery,
  useReactivateStudentMutation,
  useUpdateStudentMutation,
} from '../api/studentsApi';
import EnrollmentsSection from '../components/EnrollmentsSection';
import StudentFields from '../components/StudentFields';
import { studentSchema, toStudentBody, toStudentForm } from '../components/studentSchema';
import { studentFullName, useCanManageStudents } from '../studentDisplay';
import { StudentAvatar, StudentStatusChip } from './StudentsPage';

const actionSx = { height: 44, px: 2.25, borderColor: '#C5CCD8', bgcolor: 'background.paper' };

/**
 * A student's file (Claude Design: StudentDetailMobile / StudentDetailDesktop):
 * avatar, "Apellidos, Nombres", status and DNI, and the "Datos" card,
 * read-only until "Editar". An ADMIN retires (confirmed) or reactivates the
 * student; an inactive student is read-only until reactivated, but every
 * role can still open their file. ADMIN and TUTOR also see "Matrículas".
 * The other sections of the prototype (Apoderados, Progreso, Metas) arrive
 * with their own slices.
 */
export default function StudentDetailPage() {
  const { id } = useParams();
  const { data: student, isLoading, error } = useGetStudentQuery(id);
  // bumped by "Cancelar": see StudentDetail's onCancel
  const [formVersion, setFormVersion] = useState(0);

  if (isLoading) {
    return (
      <Box role="status" sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <CircularProgress size={32} aria-label="Cargando alumno" />
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
  // key: a fresh form whenever the server copy changes (after saving) or the edit is cancelled
  return (
    <StudentDetail
      key={`${JSON.stringify(student)}#${formVersion}`}
      student={student}
      onCancel={() => setFormVersion((v) => v + 1)}
    />
  );
}

function BackLink() {
  return (
    <Link component={RouterLink} to="/students" underline="none" sx={{ fontSize: 13, alignSelf: 'flex-start', py: 0.5 }}>
      ‹ Alumnos
    </Link>
  );
}

/**
 * "Cancelar" never calls react-hook-form's reset(): it writes the values
 * straight into the uncontrolled inputs without an input event, so MUI keeps
 * the labels where they were (over the restored text if the user had emptied
 * a field). Instead the parent remounts this form (onCancel) and MUI measures
 * every field again.
 */
function StudentDetail({ student, onCancel }) {
  const notify = useNotify();
  const canManage = useCanManageStudents();
  const [editing, setEditing] = useState(false);
  const [serverError, setServerError] = useState(null);
  const isAdmin = useIsAdmin();
  const [confirmingDeactivate, setConfirmingDeactivate] = useState(false);
  const [updateStudent] = useUpdateStudentMutation();
  const [deactivateStudent, { isLoading: deactivating }] = useDeactivateStudentMutation();
  const [reactivateStudent, { isLoading: reactivating }] = useReactivateStudentMutation();
  const name = studentFullName(student);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(studentSchema), defaultValues: toStudentForm(student) });

  const onSubmit = async (values) => {
    setServerError(null);
    try {
      await updateStudent({ id: student.id, ...toStudentBody(values) }).unwrap();
      notify('Alumno actualizado.');
      setEditing(false);
    } catch (error) {
      setServerError(errorDetail(error)); // keep the form open with what was typed
    }
  };

  const confirmDeactivate = async () => {
    try {
      await deactivateStudent(student.id).unwrap();
      notify('Alumno dado de baja.');
    } catch (error) {
      notify(errorDetail(error), 'error');
    } finally {
      setConfirmingDeactivate(false);
    }
  };

  const reactivate = async () => {
    try {
      await reactivateStudent(student.id).unwrap();
      notify('Alumno reactivado.');
    } catch (error) {
      notify(errorDetail(error), 'error');
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, maxWidth: 760 }}>
      <BackLink />

      <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2 }}>
        <StudentAvatar student={student} size={56} />
        <Box sx={{ flex: '1 1 240px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 0.75 }}>
          <Typography component="h1" sx={{ fontSize: { xs: 22, md: 26 }, fontWeight: 500 }}>
            {name}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1, fontSize: 14, color: 'text.secondary' }}>
            <StudentStatusChip active={student.active} />
            <span>{student.dni ? `DNI ${student.dni}` : 'Sin DNI'}</span>
          </Box>
        </Box>
        {student.active ? (
          <Box sx={{ display: 'flex', gap: 1 }}>
            {canManage && !editing && (
              <Button variant="outlined" onClick={() => setEditing(true)} sx={{ ...actionSx, color: colors.primary }}>
                Editar
              </Button>
            )}
            {isAdmin && (
              <Button
                variant="outlined"
                onClick={() => setConfirmingDeactivate(true)}
                disabled={editing}
                sx={{ ...actionSx, color: colors.danger }}
              >
                Dar de baja
              </Button>
            )}
          </Box>
        ) : (
          isAdmin && (
            <Button variant="outlined" onClick={reactivate} disabled={reactivating} sx={{ ...actionSx, color: colors.primary }}>
              Reactivar
            </Button>
          )
        )}
      </Box>

      <Box
        component="form"
        noValidate
        onSubmit={handleSubmit(onSubmit)}
        aria-labelledby="student-data-title"
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
        <Typography id="student-data-title" component="h2" sx={{ fontSize: 16, fontWeight: 500 }}>
          Datos
        </Typography>

        <StudentFields register={register} errors={errors} disabled={!editing} compact />

        {serverError && <Alert severity="error">{serverError}</Alert>}

        {editing && (
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
            <Button variant="outlined" onClick={onCancel} disabled={isSubmitting} sx={{ minWidth: 120, height: 44 }}>
              Cancelar
            </Button>
            <Button type="submit" variant="contained" color="secondary" disabled={isSubmitting} sx={{ minWidth: 120, height: 44 }}>
              Guardar
            </Button>
          </Box>
        )}
      </Box>

      {/* ADMIN and TUTOR: a coordinator does not see enrollments */}
      {canManage && <EnrollmentsSection student={student} />}

      {!student.active && (
        <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
          Este alumno está dado de baja: no aparece en las listas de trabajo. Su historial sigue intacto.
        </Typography>
      )}

      {confirmingDeactivate && (
        <ConfirmDialog
          title="¿Dar de baja al alumno?"
          message={`${name} dejará de aparecer en las listas de alumnos activos, pero su historial (exámenes, metas y bitácora) permanece intacto. Podrás reactivarlo cuando quieras.`}
          confirmLabel="Dar de baja"
          danger
          loading={deactivating}
          onConfirm={confirmDeactivate}
          onCancel={() => setConfirmingDeactivate(false)}
        />
      )}
    </Box>
  );
}
