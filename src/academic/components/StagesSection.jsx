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
import { useChangeStageStatusMutation, useDeleteStageMutation, useGetStagesQuery } from '../api/stagesApi';
import { STAGE_STATUS, formatShortDate, stageDates, todayIso } from '../cycleDisplay';
import CycleStatusChip from './CycleStatusChip';
import StageForm from './StageForm';

/**
 * "Etapas" of a cycle (Claude Design: CycleDetailMobile): one card per
 * stage by start date, the one in force marked "Vigente", and "Nueva etapa".
 * The top of a card opens the stage's form; below it sits the one action
 * that moves the stage forward: "Activar etapa" (planned) or "Cerrar etapa"
 * (active). In a closed cycle (and for a closed stage) nothing can be
 * edited: the only action left is "Eliminar".
 * The enrollment count and "Matricular en lote" of the prototype arrive
 * with the students slices.
 */
export default function StagesSection({ cycle }) {
  const notify = useNotify();
  const { data: stages = [], isLoading, error } = useGetStagesQuery(cycle.id);
  const [deleteStage, { isLoading: deleting }] = useDeleteStageMutation();
  const [changeStatus, { isLoading: changingStatus }] = useChangeStageStatusMutation();
  // null = closed, {} = creating, a stage = editing it
  const [editing, setEditing] = useState(null);
  const [deletingStage, setDeletingStage] = useState(null);
  // null, or { kind, stage } with kind: 'activate' | 'close' | 'noEndDate' | 'endDateInFuture'
  const [statusDialog, setStatusDialog] = useState(null);
  const cycleClosed = cycle.status === 'CLOSED';

  const confirmDelete = async () => {
    try {
      await deleteStage({ cycleId: cycle.id, id: deletingStage.id }).unwrap();
      notify('Etapa eliminada.');
    } catch (err) {
      notify(errorDetail(err), 'error');
    } finally {
      setDeletingStage(null);
    }
  };

  // The system never changes a stage's end date: closing needs one that has
  // already arrived, so otherwise the admin is sent to correct it first.
  const askToClose = (stage) => {
    if (!stage.endDate) setStatusDialog({ kind: 'noEndDate', stage });
    else setStatusDialog({ kind: stage.endDate > todayIso() ? 'endDateInFuture' : 'close', stage });
  };

  const change = async (stage, status) => {
    try {
      await changeStatus({ cycleId: cycle.id, id: stage.id, status }).unwrap();
      notify(status === 'ACTIVE' ? 'Etapa activada.' : 'Etapa cerrada.');
    } catch (err) {
      notify(errorDetail(err), 'error'); // the backend has the last word
    } finally {
      setStatusDialog(null);
    }
  };

  const editFromDialog = (stage) => {
    setStatusDialog(null);
    setEditing(stage);
  };

  const statusDialogProps = (dialog) => {
    const { kind, stage } = dialog;
    if (kind === 'activate') {
      return {
        title: '¿Activar etapa?',
        message: `"${stage.name}" pasará a ser la etapa activa del ciclo. Este cambio no se puede deshacer.`,
        confirmLabel: 'Activar',
        onConfirm: () => change(stage, 'ACTIVE'),
      };
    }
    if (kind === 'close') {
      return {
        title: '¿Cerrar etapa?',
        message: `"${stage.name}" quedará cerrada y ya no se podrá editar. Este cambio no se puede deshacer.`,
        confirmLabel: 'Cerrar etapa',
        onConfirm: () => change(stage, 'CLOSED'),
      };
    }
    if (kind === 'noEndDate') {
      return {
        title: 'Falta la fecha de fin',
        message: `Para cerrar "${stage.name}" primero define su fecha de fin.`,
        confirmLabel: 'Definir fecha de fin',
        onConfirm: () => editFromDialog(stage),
      };
    }
    return {
      title: 'La fecha de fin todavía no llega',
      message:
        `"${stage.name}" termina el ${formatShortDate(stage.endDate)}. Si quieres cerrarla hoy, ` +
        'corrige primero su fecha de fin: el sistema no la cambia por ti.',
      confirmLabel: 'Corregir fecha de fin',
      onConfirm: () => editFromDialog(stage),
    };
  };

  return (
    <Box component="section" aria-labelledby="stages-title" sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', minHeight: 36, mt: 0.5 }}>
        <Typography id="stages-title" component="h2" sx={{ fontSize: 16, fontWeight: 500 }}>
          Etapas
        </Typography>
        {!cycleClosed && (
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => setEditing({})}
            sx={{ display: { xs: 'none', md: 'inline-flex' }, height: 36, borderColor: '#C5CCD8', color: colors.primary }}
          >
            Nueva etapa
          </Button>
        )}
      </Box>

      {isLoading && (
        <Box role="status" sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
          <CircularProgress size={28} aria-label="Cargando etapas" />
        </Box>
      )}

      {!isLoading && error && <Alert severity="error">{errorDetail(error)}</Alert>}

      {!isLoading && !error && stages.length === 0 && (
        <Typography sx={{ py: 2, textAlign: 'center', fontSize: 14, color: 'text.secondary' }}>
          Este ciclo aún no tiene etapas.
        </Typography>
      )}

      {!isLoading && !error && stages.length > 0 && (
        <Box component="ul" sx={{ listStyle: 'none', m: 0, p: 0, display: 'flex', flexDirection: 'column', gap: 1.25 }}>
          {stages.map((stage) => {
            const editable = !cycleClosed && stage.status !== 'CLOSED';
            return (
              <Box component="li" key={stage.id}>
                <StageCard
                  stage={stage}
                  onEdit={editable ? () => setEditing(stage) : undefined}
                  onDelete={editable ? undefined : () => setDeletingStage(stage)}
                  onActivate={
                    editable && stage.status === 'PLANNED' ? () => setStatusDialog({ kind: 'activate', stage }) : undefined
                  }
                  onClose={editable && stage.status === 'ACTIVE' ? () => askToClose(stage) : undefined}
                />
              </Box>
            );
          })}
        </Box>
      )}

      {!cycleClosed && (
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
          Nueva etapa
        </Fab>
      )}

      {editing && (
        <StageForm
          cycle={cycle}
          stage={editing.id ? editing : null}
          onClose={() => setEditing(null)}
          onDelete={() => {
            setDeletingStage(editing);
            setEditing(null);
          }}
        />
      )}

      {statusDialog && (
        <ConfirmDialog {...statusDialogProps(statusDialog)} loading={changingStatus} onCancel={() => setStatusDialog(null)} />
      )}

      {deletingStage && (
        <ConfirmDialog
          title="¿Eliminar etapa?"
          message={
            `"${deletingStage.name}" dejará de aparecer en el ciclo y no podrás recuperarla. ` +
            'Solo se puede eliminar una etapa sin alumnos matriculados ni exámenes.'
          }
          confirmLabel="Eliminar"
          danger
          loading={deleting}
          onConfirm={confirmDelete}
          onCancel={() => setDeletingStage(null)}
        />
      )}
    </Box>
  );
}

function StageCard({ stage, onEdit, onDelete, onActivate, onClose }) {
  const cardSx = {
    bgcolor: 'background.paper',
    border: 1,
    // the stage in force stands out with the blue border of the prototype
    borderColor: stage.current ? colors.secondary : 'divider',
    borderRadius: '16px',
    overflow: 'hidden',
  };
  const content = (
    <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1 }}>
        <Typography sx={{ fontSize: 15, fontWeight: 500 }}>{stage.name}</Typography>
        {stage.current && (
          <Box
            component="span"
            sx={{ fontSize: 12, fontWeight: 500, px: 1.25, py: 0.375, borderRadius: '12px', bgcolor: colors.secondary, color: '#FFFFFF' }}
          >
            Vigente
          </Box>
        )}
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
        <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>{stageDates(stage)}</Typography>
        <CycleStatusChip status={stage.status} statuses={STAGE_STATUS} />
      </Box>
    </Box>
  );

  if (!onEdit) {
    return (
      <Box sx={{ ...cardSx, display: 'flex', alignItems: 'center', gap: 1.5, px: 2, py: 1.75 }}>
        {content}
        <Button size="small" onClick={onDelete} aria-label={`Eliminar ${stage.name}`} sx={{ color: colors.danger }}>
          Eliminar
        </Button>
      </Box>
    );
  }

  const action = onActivate
    ? { label: 'Activar etapa', onClick: onActivate, sx: { bgcolor: colors.selected, color: colors.primary } }
    : onClose && { label: 'Cerrar etapa', onClick: onClose, sx: { border: 1, borderColor: '#C5CCD8', color: '#3A4150' } };

  return (
    <Box sx={{ ...cardSx, display: 'flex', flexDirection: 'column' }}>
      <ButtonBase
        onClick={onEdit}
        aria-label={`Editar ${stage.name}`}
        sx={{ width: '100%', display: 'flex', textAlign: 'left', px: 2, pt: 1.75, pb: action ? 1.25 : 1.75 }}
      >
        {content}
      </ButtonBase>
      {action && (
        <Box sx={{ px: 2, pb: 1.75 }}>
          {/* same place and shape as the prototype's in-card action */}
          <Button
            fullWidth
            onClick={action.onClick}
            aria-label={`${action.label}: ${stage.name}`}
            sx={{ height: 40, fontSize: 14, ...action.sx }}
          >
            {action.label}
          </Button>
        </Box>
      )}
    </Box>
  );
}
