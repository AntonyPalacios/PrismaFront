import { useState } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ButtonBase from '@mui/material/ButtonBase';
import CircularProgress from '@mui/material/CircularProgress';
import Fab from '@mui/material/Fab';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import { errorDetail } from '../../app/api/errors';
import { useNotify } from '../../app/notifyContext';
import { colors } from '../../app/theme';
import ConfirmDialog from '../../layout/ConfirmDialog';
import { useIsAdmin } from '../../users/api/authApi';
import { useGetCareersQuery, useReactivateCareerMutation } from '../api/careersApi';
import CareerForm from './CareerForm';

const STATUS = {
  active: { label: 'Activa', bg: '#E8F5D6', fg: '#2F5A08' },
  inactive: { label: 'Inactiva', bg: '#ECEFF3', fg: '#4A5160' },
};

/**
 * "Carreras" tab (Claude Design: CareersMobile). ADMIN creates, edits and
 * deactivates (inside the form) active careers and reactivates inactive
 * ones; other roles only read.
 */
export default function CareersPanel() {
  const isAdmin = useIsAdmin();
  const notify = useNotify();
  const { data: careers = [], isLoading, error } = useGetCareersQuery();
  const [reactivateCareer, { isLoading: reactivating }] = useReactivateCareerMutation();
  // null = closed, {} = creating, a career = editing it
  const [editing, setEditing] = useState(null);
  const [reactivatingCareer, setReactivatingCareer] = useState(null);

  const confirmReactivate = async () => {
    try {
      await reactivateCareer(reactivatingCareer.id).unwrap();
      notify('Carrera reactivada.');
    } catch (err) {
      notify(errorDetail(err), 'error');
    } finally {
      setReactivatingCareer(null);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, pb: { xs: 10, md: 0 } }}>
      {isAdmin && (
        <Box sx={{ display: { xs: 'none', md: 'flex' }, justifyContent: 'flex-end' }}>
          <Button variant="contained" color="secondary" startIcon={<AddIcon />} onClick={() => setEditing({})}>
            Nueva carrera
          </Button>
        </Box>
      )}

      {isLoading && (
        <Box role="status" sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress size={32} aria-label="Cargando carreras" />
        </Box>
      )}

      {!isLoading && error && <Alert severity="error">{errorDetail(error)}</Alert>}

      {!isLoading && !error && (
        <>
          <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
            {careers.length} {careers.length === 1 ? 'carrera' : 'carreras'} · orden A–Z
          </Typography>
          <Box component="ul" sx={{ listStyle: 'none', m: 0, p: 0, display: 'flex', flexDirection: 'column', gap: 1 }}>
            {careers.map((career) => (
              <Box component="li" key={career.id}>
                <CareerCard
                  career={career}
                  onEdit={isAdmin && career.active ? () => setEditing(career) : undefined}
                  onReactivate={isAdmin && !career.active ? () => setReactivatingCareer(career) : undefined}
                />
              </Box>
            ))}
          </Box>
        </>
      )}

      {isAdmin && (
        <Fab
          variant="extended"
          color="secondary"
          onClick={() => setEditing({})}
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
          Nueva carrera
        </Fab>
      )}

      {editing && <CareerForm career={editing.id ? editing : null} onClose={() => setEditing(null)} />}

      {reactivatingCareer && (
        <ConfirmDialog
          title="¿Reactivar carrera?"
          message={`"${reactivatingCareer.name}" volverá a estar activa y se podrá elegir en las matrículas.`}
          confirmLabel="Reactivar"
          loading={reactivating}
          onConfirm={confirmReactivate}
          onCancel={() => setReactivatingCareer(null)}
        />
      )}
    </Box>
  );
}

function CareerCard({ career, onEdit, onReactivate }) {
  const status = career.active ? STATUS.active : STATUS.inactive;
  const subtitle = [career.abbreviation, career.examTypeName].filter(Boolean).join(' · ');
  const cardSx = {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: 1.5,
    px: 2,
    py: 1.75,
    bgcolor: 'background.paper',
    border: 1,
    borderColor: 'divider',
    borderRadius: '14px',
    textAlign: 'left',
  };
  const content = (
    <>
      <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 0.25 }}>
        <Typography sx={{ fontSize: 15, fontWeight: 500, color: career.active ? 'text.primary' : 'text.secondary' }}>
          {career.name}
        </Typography>
        <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>{subtitle}</Typography>
      </Box>
      <Box
        component="span"
        sx={{ fontSize: 12, fontWeight: 500, px: 1.25, py: 0.375, borderRadius: '12px', bgcolor: status.bg, color: status.fg }}
      >
        {status.label}
      </Box>
    </>
  );

  if (onEdit) {
    return (
      <ButtonBase onClick={onEdit} aria-label={`Editar ${career.name}`} sx={{ ...cardSx, '&:hover': { borderColor: colors.secondary } }}>
        {content}
      </ButtonBase>
    );
  }
  return (
    <Box sx={cardSx}>
      {content}
      {onReactivate && (
        <Button size="small" variant="outlined" color="secondary" onClick={onReactivate} aria-label={`Reactivar ${career.name}`}>
          Reactivar
        </Button>
      )}
    </Box>
  );
}
