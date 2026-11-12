import { useState } from 'react';
import { useNavigate } from 'react-router';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ButtonBase from '@mui/material/ButtonBase';
import CircularProgress from '@mui/material/CircularProgress';
import Fab from '@mui/material/Fab';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import { errorDetail } from '../../app/api/errors';
import { colors } from '../../app/theme';
import { useGetCyclesQuery } from '../api/cyclesApi';
import CycleForm from '../components/CycleForm';
import CycleStatusChip from '../components/CycleStatusChip';
import { cycleDates, formatDate } from '../cycleDisplay';

/**
 * "Ciclos" (ADMIN only). Cards on mobile, a table on desktop, most recent
 * first (sorted by the backend). A row opens the cycle's detail.
 */
export default function CyclesPage() {
  const navigate = useNavigate();
  const [creating, setCreating] = useState(false);
  const { data: cycles = [], isLoading, error } = useGetCyclesQuery();
  const open = (cycle) => navigate(`/cycles/${cycle.id}`);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 960, pb: { xs: 10, md: 0 } }}>
      <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'flex-end', justifyContent: 'space-between', gap: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <Typography component="h1" sx={{ fontSize: 28, fontWeight: 500 }}>
            Ciclos
          </Typography>
          <Typography sx={{ fontSize: 14, color: 'text.secondary' }}>
            Los periodos en los que se organiza el trabajo de la academia.
          </Typography>
        </Box>
        <Button variant="contained" color="secondary" startIcon={<AddIcon />} onClick={() => setCreating(true)}>
          Nuevo ciclo
        </Button>
      </Box>

      {isLoading && (
        <Box role="status" sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress size={32} aria-label="Cargando ciclos" />
        </Box>
      )}

      {!isLoading && error && <Alert severity="error">{errorDetail(error)}</Alert>}

      {!isLoading && !error && cycles.length === 0 && (
        <Typography sx={{ py: 4, textAlign: 'center', color: 'text.secondary' }}>Aún no hay ciclos creados.</Typography>
      )}

      {!isLoading && !error && cycles.length > 0 && (
        <>
          <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
            {cycles.length} {cycles.length === 1 ? 'ciclo' : 'ciclos'} · del más reciente al más antiguo
          </Typography>

          {/* mobile */}
          <Box
            component="ul"
            sx={{ display: { xs: 'flex', md: 'none' }, listStyle: 'none', m: 0, p: 0, flexDirection: 'column', gap: 1 }}
          >
            {cycles.map((cycle) => (
              <Box component="li" key={cycle.id}>
                <CycleCard cycle={cycle} onOpen={() => open(cycle)} />
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
            <Table aria-label="Ciclos">
              <TableHead>
                <TableRow>
                  <TableCell>Nombre</TableCell>
                  <TableCell>Inicio</TableCell>
                  <TableCell>Fin</TableCell>
                  <TableCell>Estado</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {cycles.map((cycle) => (
                  <TableRow key={cycle.id} hover onClick={() => open(cycle)} sx={{ cursor: 'pointer' }}>
                    <TableCell>
                      <ButtonBase
                        onClick={(e) => {
                          e.stopPropagation();
                          open(cycle);
                        }}
                        sx={{ fontSize: 14, fontWeight: 500 }}
                      >
                        {cycle.name}
                      </ButtonBase>
                    </TableCell>
                    <TableCell>{formatDate(cycle.startDate)}</TableCell>
                    <TableCell sx={{ color: cycle.endDate ? 'text.primary' : 'text.secondary' }}>
                      {formatDate(cycle.endDate) ?? 'Sin fecha de fin'}
                    </TableCell>
                    <TableCell>
                      <CycleStatusChip status={cycle.status} />
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
        Nuevo ciclo
      </Fab>

      {creating && <CycleForm cycle={null} onClose={() => setCreating(false)} />}
    </Box>
  );
}

function CycleCard({ cycle, onOpen }) {
  return (
    <ButtonBase
      onClick={onOpen}
      aria-label={`Ver ${cycle.name}`}
      sx={{
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
        '&:hover': { borderColor: colors.secondary },
      }}
    >
      <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 0.25 }}>
        <Typography sx={{ fontSize: 15, fontWeight: 500 }}>{cycle.name}</Typography>
        <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>{cycleDates(cycle)}</Typography>
      </Box>
      <CycleStatusChip status={cycle.status} />
    </ButtonBase>
  );
}
