import { useState } from 'react';
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
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useGetCyclesQuery } from '../../academic/api/cyclesApi';
import { useGetStagesQuery } from '../../academic/api/stagesApi';
import { formatDate } from '../../academic/cycleDisplay';
import { errorDetail } from '../../app/api/errors';
import { colors } from '../../app/theme';
import { useGetExamsQuery } from '../api/examsApi';
import ExamForm from '../components/ExamForm';
import { useCanManageExams } from '../examDisplay';

const selectProps = { select: true, size: 'small', slotProps: { select: { native: true }, inputLabel: { shrink: true } } };

/**
 * "Exámenes" (Claude Design: ExamsMobile). Pick a cycle and one of its
 * stages — by default the stage in force of the active cycle — and see its
 * exams: cards on mobile, a table on desktop, newest first with the exams of
 * one mock exam together. ADMIN and COORDINADOR create a mock exam ("Nuevo
 * examen") and edit or delete an exam; a TUTOR only reads. The "Importar
 * resultados" and "Resultado manual" actions arrive with their slices.
 */
export default function ExamsPage() {
  const canManage = useCanManageExams();
  const { data: cycles = [], isLoading: loadingCycles } = useGetCyclesQuery();
  // null = the default: the active cycle (or the most recent one) and its stage in force
  const [chosenCycleId, setChosenCycleId] = useState(null);
  const [chosenStageId, setChosenStageId] = useState(null);
  // null = closed, {} = creating, an exam = opening it
  const [open, setOpen] = useState(null);

  const cycle = cycles.find((c) => c.id === chosenCycleId) ?? cycles.find((c) => c.status === 'ACTIVE') ?? cycles[0];
  const { data: stages = [] } = useGetStagesQuery(cycle?.id, { skip: !cycle });
  const stage =
    stages.find((s) => s.id === chosenStageId) ?? stages.find((s) => s.current) ?? stages[stages.length - 1];
  const { data: exams = [], isLoading, error } = useGetExamsQuery(stage?.id, { skip: !stage });
  const canCreate = canManage && stage && cycle?.status !== 'CLOSED';

  const chooseCycle = (id) => {
    setChosenCycleId(Number(id));
    setChosenStageId(null); // its stage in force
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 1080, pb: { xs: 10, md: 0 } }}>
      <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'flex-end', justifyContent: 'space-between', gap: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <Typography component="h1" sx={{ fontSize: 28, fontWeight: 500 }}>
            Exámenes
          </Typography>
          <Typography sx={{ fontSize: 14, color: 'text.secondary' }}>Los simulacros de cada etapa, uno por tipo de examen.</Typography>
        </Box>
        {canCreate && (
          <Button variant="contained" color="secondary" startIcon={<AddIcon />} onClick={() => setOpen({})}>
            Nuevo examen
          </Button>
        )}
      </Box>

      <Box
        sx={{
          // mobile: full-bleed white strip under the app bar, as in the prototype
          mx: { xs: -2, md: 0 },
          mt: { xs: -2, md: 0 },
          px: 2,
          py: 1.5,
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
          gap: 1.5,
          bgcolor: 'background.paper',
          borderBottom: 1,
          borderColor: 'divider',
          borderRadius: { md: '12px' },
          border: { md: 1 },
        }}
      >
        <TextField {...selectProps} label="Ciclo" value={cycle?.id ?? ''} onChange={(e) => chooseCycle(e.target.value)}>
          {cycles.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </TextField>
        <TextField {...selectProps} label="Etapa" value={stage?.id ?? ''} onChange={(e) => setChosenStageId(Number(e.target.value))}>
          {stages.map((s) => (
            <option key={s.id} value={s.id}>
              {s.current ? `${s.name} (vigente)` : s.name}
            </option>
          ))}
        </TextField>
      </Box>

      {(loadingCycles || isLoading) && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress size={32} aria-label="Cargando exámenes" />
        </Box>
      )}
      {!loadingCycles && !cycle && (
        <Typography sx={{ py: 4, textAlign: 'center', color: 'text.secondary' }}>Aún no hay ciclos registrados.</Typography>
      )}
      {cycle && stages.length === 0 && !isLoading && (
        <Typography sx={{ py: 4, textAlign: 'center', color: 'text.secondary' }}>Este ciclo aún no tiene etapas.</Typography>
      )}
      {stage && !isLoading && error && <Alert severity="error">{errorDetail(error)}</Alert>}
      {stage && !isLoading && !error && exams.length === 0 && (
        <Typography sx={{ py: 4, textAlign: 'center', color: 'text.secondary' }}>Aún no hay exámenes en esta etapa.</Typography>
      )}

      {stage && !isLoading && !error && exams.length > 0 && (
        <>
          {/* mobile */}
          <Box component="ul" sx={{ display: { xs: 'flex', md: 'none' }, listStyle: 'none', m: 0, p: 0, flexDirection: 'column', gap: 1.25 }}>
            {exams.map((exam) => (
              <Box component="li" key={exam.id}>
                <ButtonBase
                  onClick={() => setOpen(exam)}
                  aria-label={`Examen ${exam.name} · ${exam.examTypeName}`}
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
                    borderRadius: '16px',
                    textAlign: 'left',
                    '&:hover': { borderColor: colors.secondary },
                  }}
                >
                  <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                    <Typography sx={{ fontSize: 15, fontWeight: 500 }}>{exam.name}</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, fontSize: 13, color: 'text.secondary' }}>
                      <TypeChip exam={exam} />
                      {formatDate(exam.examDate)}
                    </Box>
                  </Box>
                  <ChevronRightIcon aria-hidden="true" sx={{ fontSize: 20, color: '#8C96A8' }} />
                </ButtonBase>
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
            <Table aria-label="Exámenes">
              <TableHead>
                <TableRow>
                  <TableCell>Nombre</TableCell>
                  <TableCell>Tipo de examen</TableCell>
                  <TableCell>Fecha</TableCell>
                  <TableCell>Resultados</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {exams.map((exam) => (
                  <TableRow key={exam.id} hover onClick={() => setOpen(exam)} sx={{ cursor: 'pointer' }}>
                    <TableCell>
                      <ButtonBase
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpen(exam);
                        }}
                        sx={{ fontSize: 14, fontWeight: 500 }}
                      >
                        {exam.name}
                      </ButtonBase>
                    </TableCell>
                    <TableCell>
                      <TypeChip exam={exam} />
                    </TableCell>
                    <TableCell>{formatDate(exam.examDate)}</TableCell>
                    <TableCell sx={{ color: exam.hasResults ? 'inherit' : 'text.secondary' }}>
                      {exam.hasResults ? 'Cargados' : 'Pendientes'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        </>
      )}

      {canCreate && (
        <Fab
          variant="extended"
          color="secondary"
          onClick={() => setOpen({})}
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
          Nuevo examen
        </Fab>
      )}

      {open && cycle && stage && (
        <ExamForm cycle={cycle} stage={stage} exam={open.id ? open : null} canManage={canManage} onClose={() => setOpen(null)} />
      )}
    </Box>
  );
}

function TypeChip({ exam }) {
  return (
    <Box component="span" sx={{ fontSize: 12, fontWeight: 500, px: 1.25, py: 0.375, borderRadius: '12px', bgcolor: '#E1EBF7', color: colors.primary }}>
      {exam.examTypeName}
    </Box>
  );
}
