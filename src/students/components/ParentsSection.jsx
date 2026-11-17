import { useState } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import { errorDetail } from '../../app/api/errors';
import { useNotify } from '../../app/notifyContext';
import { colors } from '../../app/theme';
import ConfirmDialog from '../../layout/ConfirmDialog';
import { useGetStudentParentsQuery, useUnlinkParentMutation } from '../api/parentsApi';
import ParentForm from './ParentForm';
import { relationshipLabel } from './parentSchema';

/**
 * "Apoderados" of a student's file (REQ-STUDENTS-03, Claude Design:
 * StudentDetailDesktop): who to contact, with the relationship and, when
 * they also look after siblings, who else. ADMIN and TUTOR see it (the
 * parent decides); {@code canChange} — the admin or the current tutor, on
 * an active student — links, edits and unlinks.
 */
export default function ParentsSection({ student, canChange }) {
  const notify = useNotify();
  const { data, isLoading, error } = useGetStudentParentsQuery(student.id);
  const parents = Array.isArray(data) ? data : [];
  const [unlinkParent, { isLoading: unlinking }] = useUnlinkParentMutation();
  // null = closed, {} = linking, a guardian = editing them
  const [open, setOpen] = useState(null);
  const [unlinkingParent, setUnlinkingParent] = useState(null);

  const confirmUnlink = async () => {
    try {
      await unlinkParent({ studentId: student.id, parentId: unlinkingParent.parentId }).unwrap();
      notify('Apoderado desvinculado.');
    } catch (err) {
      notify(errorDetail(err), 'error');
    } finally {
      setUnlinkingParent(null);
    }
  };

  return (
    <Box
      component="section"
      aria-labelledby="student-parents-title"
      sx={{ bgcolor: 'background.paper', border: 1, borderColor: 'divider', borderRadius: '16px', p: 2.5, display: 'flex', flexDirection: 'column', gap: 1.75 }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5 }}>
        <Typography id="student-parents-title" component="h2" sx={{ fontSize: 16, fontWeight: 500 }}>
          Apoderados
        </Typography>
        {canChange && (
          <Button
            variant="outlined"
            onClick={() => setOpen({})}
            sx={{ height: 36, px: 1.75, borderRadius: '18px', borderColor: '#C5CCD8', color: colors.primary, fontSize: 13 }}
          >
            + Vincular apoderado
          </Button>
        )}
      </Box>

      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
          <CircularProgress size={24} aria-label="Cargando apoderados" />
        </Box>
      )}
      {error && <Alert severity="error">{errorDetail(error)}</Alert>}
      {!isLoading && !error && parents.length === 0 && (
        <Typography sx={{ fontSize: 14, color: 'text.secondary' }}>Aún no tiene apoderados registrados.</Typography>
      )}

      {parents.length > 0 && (
        <Box component="ul" aria-label="Apoderados del alumno" sx={{ listStyle: 'none', m: 0, p: 0, display: 'flex', flexDirection: 'column', gap: 1 }}>
          {parents.map((parent) => (
            <Box component="li" key={parent.parentId} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, borderRadius: '12px', bgcolor: colors.background }}>
              <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 0.25 }}>
                <Typography sx={{ fontSize: 14, fontWeight: 500 }}>{parent.fullName}</Typography>
                <Typography sx={{ fontSize: 13, color: 'text.secondary', overflowWrap: 'anywhere' }}>
                  {[parent.phone, parent.email].filter(Boolean).join(' · ')}
                </Typography>
                {parent.otherStudents.length > 0 && (
                  <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>{`También de: ${parent.otherStudents.join('; ')}`}</Typography>
                )}
              </Box>
              <Box
                component="span"
                sx={{ flex: 'none', fontSize: 12, fontWeight: 500, px: 1.25, py: 0.375, borderRadius: '12px', bgcolor: colors.selected, color: colors.primary }}
              >
                {relationshipLabel(parent.relationshipType)}
              </Box>
              {canChange && (
                <>
                  <IconButton onClick={() => setOpen(parent)} aria-label={`Editar a ${parent.fullName}`} sx={{ width: 40, height: 40, color: 'text.secondary' }}>
                    <EditOutlinedIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    onClick={() => setUnlinkingParent(parent)}
                    aria-label={`Desvincular a ${parent.fullName}`}
                    sx={{ width: 40, height: 40, color: 'text.secondary' }}
                  >
                    <LinkOffIcon fontSize="small" />
                  </IconButton>
                </>
              )}
            </Box>
          ))}
        </Box>
      )}

      {open && <ParentForm student={student} parent={open.parentId ? open : null} onClose={() => setOpen(null)} />}

      {unlinkingParent && (
        <ConfirmDialog
          title="¿Desvincular apoderado?"
          message={
            `${unlinkingParent.fullName} dejará de figurar como apoderado de este alumno. ` +
            'Seguirá registrado y podrás volver a vincularlo.'
          }
          confirmLabel="Desvincular"
          danger
          loading={unlinking}
          onConfirm={confirmUnlink}
          onCancel={() => setUnlinkingParent(null)}
        />
      )}
    </Box>
  );
}
