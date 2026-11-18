import Box from '@mui/material/Box';

const MET = { bgcolor: '#E8F5D6', color: '#2F5A08' };
const MISSED = { bgcolor: '#FDE7E8', color: '#8E0F14' };

/** "Real 10 · Lograda": the correct answers they got against the goal, once they sat the exam. */
export function GoalOutcome({ target, actual }) {
  if (actual == null) return null;
  const met = actual >= target;
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 0.5, fontSize: 12, color: 'text.secondary', whiteSpace: 'nowrap' }}>
      {`Real ${actual}`}
      <Box component="span" sx={{ fontWeight: 500, px: 1, py: 0.25, borderRadius: '10px', ...(met ? MET : MISSED) }}>
        {met ? 'Lograda' : 'No lograda'}
      </Box>
    </Box>
  );
}
