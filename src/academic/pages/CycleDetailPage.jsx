import { useState } from 'react';
import { Link as RouterLink, useParams } from 'react-router';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import { errorDetail } from '../../app/api/errors';
import { colors } from '../../app/theme';
import { useGetCycleQuery } from '../api/cyclesApi';
import CycleForm from '../components/CycleForm';
import CycleStatusChip from '../components/CycleStatusChip';
import { formatDate } from '../cycleDisplay';

/**
 * A cycle's detail (Claude Design: CycleDetailMobile): status chip,
 * "Editar", and its dates. A closed cycle is read-only. "Cerrar ciclo" and
 * the "Etapas" section of the prototype arrive with their own slices.
 */
export default function CycleDetailPage() {
  const { id } = useParams();
  const { data: cycle, isLoading, error } = useGetCycleQuery(id);
  const [editing, setEditing] = useState(false);

  if (isLoading) {
    return (
      <Box role="status" sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <CircularProgress size={32} aria-label="Cargando ciclo" />
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

  const closed = cycle.status === 'CLOSED';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 640 }}>
      <BackLink />

      <Typography component="h1" sx={{ fontSize: { xs: 22, md: 26 }, fontWeight: 500 }}>
        {cycle.name}
      </Typography>

      <Box
        component="section"
        aria-label="Datos del ciclo"
        sx={{
          bgcolor: 'background.paper',
          border: 1,
          borderColor: 'divider',
          borderRadius: '16px',
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 1.75,
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', minHeight: 36 }}>
          <CycleStatusChip status={cycle.status} />
          {!closed && (
            <Button
              variant="outlined"
              onClick={() => setEditing(true)}
              sx={{ height: 36, px: 1.75, fontSize: 13, borderColor: '#C5CCD8', color: colors.primary }}
            >
              Editar
            </Button>
          )}
        </Box>
        <Box component="dl" sx={{ m: 0, display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 1.5 }}>
          <DateField label="Inicio" value={formatDate(cycle.startDate)} />
          <DateField label="Fin" value={formatDate(cycle.endDate) ?? 'Sin fecha de fin'} muted={!cycle.endDate} />
        </Box>
      </Box>

      {closed && (
        <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
          Este ciclo está cerrado: se conserva como historial y ya no se puede editar.
        </Typography>
      )}

      {editing && <CycleForm cycle={cycle} onClose={() => setEditing(false)} />}
    </Box>
  );
}

function BackLink() {
  return (
    <Link component={RouterLink} to="/cycles" underline="none" sx={{ fontSize: 13, alignSelf: 'flex-start', py: 0.5 }}>
      ‹ Ciclos
    </Link>
  );
}

function DateField({ label, value, muted = false }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
      <Typography component="dt" sx={{ fontSize: 12, color: 'text.secondary' }}>
        {label}
      </Typography>
      <Typography component="dd" sx={{ m: 0, fontSize: 14, color: muted ? 'text.secondary' : 'text.primary' }}>
        {value}
      </Typography>
    </Box>
  );
}
