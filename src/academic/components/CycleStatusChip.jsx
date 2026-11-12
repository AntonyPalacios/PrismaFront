import Box from '@mui/material/Box';
import { CYCLE_STATUS } from '../cycleDisplay';

/** Status chip of a cycle, or of a stage when given STAGE_STATUS (same states, feminine labels). */
export default function CycleStatusChip({ status, statuses = CYCLE_STATUS }) {
  const display = statuses[status] ?? { label: status, bg: '#ECEFF3', fg: '#4A5160' };
  return (
    <Box
      component="span"
      sx={{
        fontSize: 12,
        fontWeight: 500,
        px: 1.25,
        py: 0.375,
        borderRadius: '12px',
        whiteSpace: 'nowrap',
        bgcolor: display.bg,
        color: display.fg,
      }}
    >
      {display.label}
    </Box>
  );
}
