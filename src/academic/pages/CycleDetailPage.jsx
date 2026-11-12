import { useState } from 'react';
import { Link as RouterLink, useParams } from 'react-router';
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
import { useChangeCycleStatusMutation, useGetCycleQuery } from '../api/cyclesApi';
import CycleForm from '../components/CycleForm';
import CycleStatusChip from '../components/CycleStatusChip';
import { formatDate, todayIso } from '../cycleDisplay';

const NEXT_CYCLE_WARNING = 'el siguiente ciclo solo podrá empezar después de esa fecha';

/**
 * A cycle's detail (Claude Design: CycleDetailMobile): status chip,
 * "Editar", its dates, and the one action that moves it forward:
 * "Activar ciclo" (planned) or "Cerrar ciclo" (active). A closed cycle is
 * read-only. The "Etapas" section of the prototype arrives with its slice.
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
        {!closed && <StatusAction cycle={cycle} onEdit={() => setEditing(true)} />}
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

/**
 * "Activar ciclo" or "Cerrar ciclo", always behind a dialog because neither
 * can be undone. The dialog is one of:
 *  - 'activate'   confirm activating;
 *  - 'close'      confirm closing on or after the end date;
 *  - 'closeEarly' confirm closing before the end date (it becomes today);
 *  - 'noEndDate'  closing is not possible yet: send the admin to the form.
 * The backend always has the last word; its rejections are shown as they come.
 */
function StatusAction({ cycle, onEdit }) {
  const notify = useNotify();
  const [dialog, setDialog] = useState(null);
  const [changeStatus, { isLoading }] = useChangeCycleStatusMutation();
  const planned = cycle.status === 'PLANNED';

  const askToClose = () => {
    if (!cycle.endDate) setDialog('noEndDate');
    else setDialog(cycle.endDate > todayIso() ? 'closeEarly' : 'close');
  };

  const change = async (status, confirm) => {
    try {
      await changeStatus({ id: cycle.id, status, confirm }).unwrap();
      notify(status === 'ACTIVE' ? 'Ciclo activado.' : 'Ciclo cerrado.');
      setDialog(null);
    } catch (error) {
      if (error?.data?.requiresConfirmation) {
        setDialog('closeEarly'); // the backend's "today" disagrees with this browser's: ask properly
        return;
      }
      setDialog(null);
      notify(errorDetail(error), 'error');
    }
  };

  const dialogs = {
    activate: {
      title: '¿Activar ciclo?',
      message: `"${cycle.name}" pasará a ser el ciclo activo. Este cambio no se puede deshacer.`,
      confirmLabel: 'Activar',
      onConfirm: () => change('ACTIVE', false),
    },
    close: {
      title: '¿Cerrar ciclo?',
      message: `"${cycle.name}" quedará cerrado como historial y ya no se podrá editar. Este cambio no se puede deshacer.`,
      confirmLabel: 'Cerrar ciclo',
      onConfirm: () => change('CLOSED', false),
    },
    closeEarly: {
      title: '¿Cerrar el ciclo antes de su fecha de fin?',
      message:
        `"${cycle.name}" termina el ${formatDate(cycle.endDate)}. Si lo cierras ahora, su fecha de fin pasará a ser hoy ` +
        `y ${NEXT_CYCLE_WARNING}. El ciclo quedará como historial y ya no se podrá editar.`,
      confirmLabel: 'Cerrar hoy',
      onConfirm: () => change('CLOSED', true),
    },
    noEndDate: {
      title: 'Falta la fecha de fin',
      message:
        `Para cerrar "${cycle.name}" primero define su fecha de fin. Elígela con cuidado: ${NEXT_CYCLE_WARNING}, ` +
        'y un ciclo cerrado ya no se puede editar.',
      confirmLabel: 'Definir fecha de fin',
      onConfirm: () => {
        setDialog(null);
        onEdit();
      },
    },
  };
  const current = dialog && dialogs[dialog];

  return (
    <>
      <Button
        variant="outlined"
        onClick={planned ? () => setDialog('activate') : askToClose}
        sx={{ height: 44, borderColor: '#C5CCD8', color: planned ? colors.primary : '#3A4150' }}
      >
        {planned ? 'Activar ciclo' : 'Cerrar ciclo'}
      </Button>

      {current && (
        <ConfirmDialog
          title={current.title}
          message={current.message}
          confirmLabel={current.confirmLabel}
          loading={isLoading}
          onConfirm={current.onConfirm}
          onCancel={() => setDialog(null)}
        />
      )}
    </>
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
