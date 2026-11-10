import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

/**
 * "Are you sure?" before a state change (deactivate, reactivate…). The
 * wording stays non-destructive: nothing is ever physically deleted.
 */
export default function ConfirmDialog({ title, message, confirmLabel, onConfirm, onCancel, loading = false, danger = false }) {
  return (
    <Dialog open onClose={loading ? undefined : onCancel} maxWidth="xs" fullWidth slotProps={{ paper: { sx: { borderRadius: '20px' } } }}>
      <DialogTitle sx={{ fontSize: 18, fontWeight: 500 }}>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{message}</DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button variant="outlined" onClick={onCancel} disabled={loading}>
          Cancelar
        </Button>
        <Button variant="contained" color={danger ? 'error' : 'secondary'} onClick={onConfirm} disabled={loading}>
          {confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
