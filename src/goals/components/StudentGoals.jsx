import { useState } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { formatShortDate } from '../../academic/cycleDisplay';
import { errorDetail } from '../../app/api/errors';
import Pager from '../../layout/Pager';
import { PAGE_SIZES, pageOf } from '../../layout/paging';
import { useGetStudentGoalsQuery } from '../api/goalsApi';

const cell = { px: 1.25, py: 1.25, borderBottom: '1px solid #EEF1F5', fontSize: 13, whiteSpace: 'nowrap', textAlign: 'left' };
const head = { ...cell, fontSize: 12, fontWeight: 500, color: 'text.secondary', borderBottom: '1px solid #E3E7EE' };

const STATUS = {
  met: { label: 'Sí', sx: { bgcolor: '#E8F5D6', color: '#2F5A08' } },
  missed: { label: 'No', sx: { bgcolor: '#FDE7E8', color: '#8E0F14' } },
  pending: { label: 'Pendiente', sx: { bgcolor: '#FFF0DD', color: '#7A4100' } },
  absent: { label: 'No asistió', sx: { bgcolor: '#ECEFF3', color: '#4A5160' } },
};

function statusOf(goal) {
  if (goal.attended === false) return STATUS.absent;
  if (goal.met == null) return STATUS.pending;
  return goal.met ? STATUS.met : STATUS.missed;
}

/**
 * "Metas por área" (Claude Design: StudentDetailDesktop), read only: the
 * student's goals in the active cycle, the newest exam first, with the
 * correct answers they got and whether each was met, 10 per page. They are
 * set in the "Metas" screen; this is the "Metas" tab of the student's file.
 */
export default function StudentGoals({ studentId }) {
  const { data, error } = useGetStudentGoalsQuery(studentId);
  const goals = Array.isArray(data) ? data : [];
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(PAGE_SIZES[0]);

  return (
    <Box
      component="section"
      aria-labelledby="student-goals-title"
      sx={{ bgcolor: 'background.paper', border: 1, borderColor: 'divider', borderRadius: '16px', p: 2.5, display: 'flex', flexDirection: 'column', gap: 1.5 }}
    >
      <Typography id="student-goals-title" component="h3" sx={{ fontSize: 16, fontWeight: 500 }}>
        Metas por área
      </Typography>
      {error && <Alert severity="error">{errorDetail(error)}</Alert>}
      {data && goals.length === 0 && (
        <Typography sx={{ fontSize: 14, color: 'text.secondary' }}>Aún no tiene metas en el ciclo activo. Se fijan en "Metas".</Typography>
      )}
      {goals.length > 0 && (
        <Box sx={{ overflowX: 'auto' }}>
          <Box component="table" aria-label="Metas por área" sx={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Área', 'Examen destino', 'Meta', 'Real', 'Cumplida'].map((label) => (
                  <Box component="th" scope="col" key={label} sx={head}>
                    {label}
                  </Box>
                ))}
              </tr>
            </thead>
            <tbody>
              {pageOf(goals, page, size).map((goal) => {
                const status = statusOf(goal);
                return (
                  <tr key={goal.id}>
                    <Box component="td" sx={cell}>
                      {goal.areaName}
                    </Box>
                    <Box component="td" sx={cell}>
                      {`${goal.mockExamName} · ${formatShortDate(goal.examDate)}`}
                    </Box>
                    <Box component="td" sx={cell}>
                      {goal.targetCorrect}
                    </Box>
                    <Box component="td" sx={cell}>
                      {goal.actual ?? '—'}
                    </Box>
                    <Box component="td" sx={cell}>
                      <Box component="span" sx={{ fontSize: 12, fontWeight: 500, px: 1.25, py: 0.375, borderRadius: '12px', ...status.sx }}>
                        {status.label}
                      </Box>
                    </Box>
                  </tr>
                );
              })}
            </tbody>
          </Box>
        </Box>
      )}
      <Pager
        count={goals.length}
        page={page}
        onPageChange={setPage}
        size={size}
        onSizeChange={(next) => {
          setSize(next);
          setPage(0);
        }}
      />
    </Box>
  );
}
