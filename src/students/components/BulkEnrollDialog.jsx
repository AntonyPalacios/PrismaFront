import { useState } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import CloseIcon from '@mui/icons-material/Close';
import { useGetCyclesQuery } from '../../academic/api/cyclesApi';
import { useGetStagesQuery } from '../../academic/api/stagesApi';
import { errorDetail } from '../../app/api/errors';
import { colors } from '../../app/theme';
import { useGetCareersQuery } from '../../catalog/api/careersApi';
import { useGetUsersQuery } from '../../users/api/usersApi';
import { useBulkEnrollMutation, useGetBulkEnrollmentPreviewQuery } from '../api/enrollmentsApi';

const selectProps = { select: true, size: 'small', slotProps: { select: { native: true }, inputLabel: { shrink: true } } };
const STEPS = ['Selección', 'Carrera y tutor', 'Resultado'];
const SKIP_LABEL = { ALREADY_ENROLLED: 'Ya matriculado: se omitirá', INACTIVE_STUDENT: 'Dado de baja: se omitirá' };
const NO_TUTOR = '#7A4100';

const th = { fontSize: 12, fontWeight: 500, color: 'text.secondary', textAlign: 'left', px: 2, py: 1.25, borderBottom: '1px solid #E3E7EE', whiteSpace: 'nowrap' };
const td = { fontSize: 14, px: 2, py: 1, borderBottom: '1px solid #EEF1F5', whiteSpace: 'nowrap' };
const pill = { height: 44, px: 2.5, borderRadius: '22px', fontSize: 14 };

const userName = (u) => `${[u.lastNamePat, u.lastNameMat].filter(Boolean).join(' ')}, ${u.firstName}`;
const toId = (value) => (value === '' ? null : Number(value));

/**
 * The stage a group usually comes from: in the target's own cycle, the last
 * one that started before it; in another cycle, its last stage.
 */
function defaultSourceId(stages, target, sameCycle) {
  const candidates = stages
    .filter((s) => s.id !== target.id && (!sameCycle || s.startDate < target.startDate))
    .sort((a, b) => a.startDate.localeCompare(b.startDate));
  return candidates.at(-1)?.id;
}

/**
 * "Matricular en lote" (REQ-STUDENTS-05, Claude Design: BulkEnrollDesktop),
 * ADMIN only: moves a group into the stage it was opened from. 1) pick the
 * source stage and who moves (everyone but those already enrolled or
 * deactivated starts checked); 2) career and tutor per student, preloaded
 * from the source stage, both optional; 3) how many were enrolled. The
 * batch is all or nothing: a rejected row saves nobody.
 */
export default function BulkEnrollDialog({ cycle, stage, onClose }) {
  const [step, setStep] = useState(0);
  const [sourceCycleId, setSourceCycleId] = useState(cycle.id);
  const [chosenSourceId, setChosenSourceId] = useState(null);
  // only what the admin changed: who was unchecked, and career/tutor per student
  const [unchecked, setUnchecked] = useState(() => new Set());
  const [edits, setEdits] = useState({});
  const [applyTutor, setApplyTutor] = useState('');
  const [result, setResult] = useState(null);

  const { data: cycles = [] } = useGetCyclesQuery();
  const { data: sourceStages = [] } = useGetStagesQuery(sourceCycleId);
  const { data: careers = [] } = useGetCareersQuery();
  const { data: users = [] } = useGetUsersQuery();
  const activeCareers = careers.filter((c) => c.active);
  const tutors = users.filter((u) => u.active && u.roles.includes('TUTOR'));

  const sourceOptions = sourceStages.filter((s) => s.id !== stage.id);
  const sourceId = chosenSourceId ?? defaultSourceId(sourceStages, stage, sourceCycleId === cycle.id);
  const sourceStage = sourceOptions.find((s) => s.id === sourceId);
  const {
    currentData: rows,
    isFetching,
    error: previewError,
  } = useGetBulkEnrollmentPreviewQuery({ sourceStageId: sourceId, targetStageId: stage.id }, { skip: !sourceId });
  const [bulkEnroll, { isLoading: saving, error: saveError, reset }] = useBulkEnrollMutation();

  const eligible = (rows ?? []).filter((r) => !r.skipReason);
  const chosen = eligible.filter((r) => !unchecked.has(r.studentId));
  const valueOf = (row) => ({
    careerId: row.careerId == null ? '' : String(row.careerId),
    tutorId: row.tutorUserId == null ? '' : String(row.tutorUserId),
    ...edits[row.studentId],
  });

  // a new source stage starts over
  const pickSource = (id) => {
    setChosenSourceId(id);
    setUnchecked(new Set());
    setEdits({});
  };
  const toggle = (studentId) =>
    setUnchecked((current) => {
      const next = new Set(current);
      if (next.has(studentId)) next.delete(studentId);
      else next.add(studentId);
      return next;
    });
  const toggleAll = () => setUnchecked(chosen.length === eligible.length ? new Set(eligible.map((r) => r.studentId)) : new Set());
  const edit = (studentId, field, value) =>
    setEdits((current) => ({ ...current, [studentId]: { ...current[studentId], [field]: value } }));
  const fillEmptyTutors = () => {
    if (!applyTutor) return;
    setEdits((current) => {
      const next = { ...current };
      chosen.filter((r) => valueOf(r).tutorId === '').forEach((r) => {
        next[r.studentId] = { ...next[r.studentId], tutorId: applyTutor };
      });
      return next;
    });
  };

  const confirm = async () => {
    try {
      const response = await bulkEnroll({
        targetStageId: stage.id,
        rows: chosen.map((r) => {
          const value = valueOf(r);
          return { studentId: r.studentId, careerId: toId(value.careerId), tutorUserId: toId(value.tutorId) };
        }),
      }).unwrap();
      setResult(response);
      setStep(2);
    } catch {
      // the alert shows the backend's message; the edits stay
    }
  };

  return (
    <Dialog open fullScreen onClose={onClose} aria-labelledby="bulk-enroll-title">
      <Box sx={{ minHeight: '100%', bgcolor: 'background.default', display: 'flex', flexDirection: 'column' }}>
        <Box
          component="header"
          sx={{ bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider', px: { xs: 1, md: 3 }, py: 1.5, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '12px 24px' }}
        >
          <IconButton onClick={onClose} aria-label="Cerrar" sx={{ width: 44, height: 44, color: 'text.primary' }}>
            <CloseIcon />
          </IconButton>
          <Box sx={{ flex: '1 1 260px', display: 'flex', flexDirection: 'column', gap: 0.25 }}>
            <Typography id="bulk-enroll-title" component="h1" sx={{ fontSize: 20, fontWeight: 500 }}>
              Matricular en lote
            </Typography>
            <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>{`Destino: Ciclo ${cycle.name} · ${stage.name}`}</Typography>
          </Box>
          <Box component="ol" aria-label="Pasos" sx={{ listStyle: 'none', m: 0, p: 0, display: 'flex', flexWrap: 'wrap', gap: '8px 20px' }}>
            {STEPS.map((label, index) => (
              <StepItem key={label} label={label} index={index} step={step} />
            ))}
          </Box>
        </Box>

        <Box
          component="main"
          sx={{ flex: 1, width: '100%', maxWidth: 1100, mx: 'auto', p: { xs: 2, md: 3 }, boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 2 }}
        >
          {step === 0 && (
            <>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5, maxWidth: 560 }}>
                <TextField
                  {...selectProps}
                  label="Ciclo de origen"
                  value={sourceCycleId}
                  onChange={(e) => {
                    setSourceCycleId(Number(e.target.value));
                    pickSource(null);
                  }}
                >
                  {cycles.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </TextField>
                <TextField {...selectProps} label="Etapa de origen" value={sourceId ?? ''} onChange={(e) => pickSource(toId(e.target.value))}>
                  {!sourceId && <option value="">Elige una etapa</option>}
                  {sourceOptions.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </TextField>
              </Box>
              {previewError && <Alert severity="error">{errorDetail(previewError)}</Alert>}
              {isFetching && !rows && (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress size={28} aria-label="Cargando alumnos" />
                </Box>
              )}
              {rows && rows.length === 0 && (
                <Typography sx={{ py: 3, textAlign: 'center', color: 'text.secondary' }}>
                  Esta etapa no tiene alumnos matriculados.
                </Typography>
              )}
              {rows && rows.length > 0 && (
                <TableBox label="Alumnos de la etapa de origen">
                  <thead>
                    <tr>
                      <Box component="th" sx={{ ...th, width: 48, py: 0 }}>
                        <Checkbox
                          checked={eligible.length > 0 && chosen.length === eligible.length}
                          indeterminate={chosen.length > 0 && chosen.length < eligible.length}
                          disabled={eligible.length === 0}
                          onChange={toggleAll}
                          slotProps={{ input: { 'aria-label': 'Elegir a todos' } }}
                        />
                      </Box>
                      <Box component="th" sx={th}>
                        Alumno
                      </Box>
                      <Box component="th" sx={th} />
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => (
                      <tr key={row.studentId}>
                        <Box component="td" sx={{ ...td, py: 0 }}>
                          <Checkbox
                            checked={!row.skipReason && !unchecked.has(row.studentId)}
                            disabled={Boolean(row.skipReason)}
                            onChange={() => toggle(row.studentId)}
                            slotProps={{ input: { 'aria-label': `Elegir a ${row.fullName}` } }}
                          />
                        </Box>
                        <Box component="td" sx={{ ...td, fontWeight: 500, color: row.skipReason ? 'text.secondary' : 'text.primary' }}>
                          {row.fullName}
                        </Box>
                        <Box component="td" sx={{ ...td, fontSize: 13, color: 'text.secondary' }}>
                          {SKIP_LABEL[row.skipReason] ?? ''}
                        </Box>
                      </tr>
                    ))}
                  </tbody>
                </TableBox>
              )}
            </>
          )}

          {step === 1 && (
            <>
              <Box
                sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', gap: '12px 16px', p: '14px 16px', bgcolor: 'background.paper', border: 1, borderColor: 'divider', borderRadius: '16px' }}
              >
                <Typography sx={{ flex: '1 1 240px', fontSize: 14, color: '#3A4150' }}>
                  <Box component="b" sx={{ fontWeight: 500, color: 'text.primary' }}>
                    {chosen.length === 1 ? '1 alumno' : `${chosen.length} alumnos`}
                  </Box>
                  {` desde ${sourceStage?.name ?? 'la etapa de origen'}. Carrera y tutor son opcionales por alumno.`}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
                  <TextField
                    {...selectProps}
                    label="Aplicar un tutor a todos los vacíos"
                    value={applyTutor}
                    onChange={(e) => setApplyTutor(e.target.value)}
                    sx={{ minWidth: 240 }}
                  >
                    <option value="">Elige un tutor…</option>
                    {tutors.map((t) => (
                      <option key={t.id} value={t.id}>
                        {userName(t)}
                      </option>
                    ))}
                  </TextField>
                  <Button variant="outlined" onClick={fillEmptyTutors} disabled={!applyTutor} sx={{ height: 40, borderRadius: '20px', borderColor: '#C5CCD8', color: colors.primary }}>
                    Aplicar
                  </Button>
                </Box>
              </Box>
              {saveError && <Alert severity="error">{errorDetail(saveError)}</Alert>}
              <TableBox label="Carrera y tutor por alumno">
                <thead>
                  <tr>
                    <Box component="th" sx={th}>
                      Alumno
                    </Box>
                    <Box component="th" sx={th}>
                      Carrera
                    </Box>
                    <Box component="th" sx={th}>
                      Tutor
                    </Box>
                  </tr>
                </thead>
                <tbody>
                  {chosen.map((row) => {
                    const value = valueOf(row);
                    return (
                      <tr key={row.studentId}>
                        <Box component="td" sx={{ ...td, fontWeight: 500 }}>
                          {row.fullName}
                        </Box>
                        <Box component="td" sx={td}>
                          <TextField
                            {...selectProps}
                            value={value.careerId}
                            onChange={(e) => edit(row.studentId, 'careerId', e.target.value)}
                            slotProps={{ ...selectProps.slotProps, htmlInput: { 'aria-label': `Carrera de ${row.fullName}` } }}
                            sx={{ minWidth: 200 }}
                          >
                            <option value="">Sin carrera</option>
                            {activeCareers.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.name}
                              </option>
                            ))}
                          </TextField>
                        </Box>
                        <Box component="td" sx={td}>
                          <TextField
                            {...selectProps}
                            value={value.tutorId}
                            onChange={(e) => edit(row.studentId, 'tutorId', e.target.value)}
                            slotProps={{ ...selectProps.slotProps, htmlInput: { 'aria-label': `Tutor de ${row.fullName}` } }}
                            sx={{ minWidth: 220, '& select': { color: value.tutorId ? 'text.primary' : NO_TUTOR } }}
                          >
                            <option value="">Sin tutor</option>
                            {tutors.map((t) => (
                              <option key={t.id} value={t.id}>
                                {userName(t)}
                              </option>
                            ))}
                          </TextField>
                        </Box>
                      </tr>
                    );
                  })}
                </tbody>
              </TableBox>
            </>
          )}

          {step === 2 && result && (
            <Box
              role="status"
              sx={{ bgcolor: 'background.paper', border: 1, borderColor: 'divider', borderRadius: '16px', p: 3, display: 'flex', flexDirection: 'column', gap: 1 }}
            >
              <Typography sx={{ fontSize: 18, fontWeight: 500 }}>
                {result.created === 1
                  ? `1 alumno matriculado en ${stage.name}.`
                  : `${result.created} alumnos matriculados en ${stage.name}.`}
              </Typography>
              {result.skipped > 0 && (
                <Typography sx={{ fontSize: 14, color: 'text.secondary' }}>
                  {result.skipped === 1
                    ? '1 alumno se omitió porque ya estaba matriculado o fue dado de baja.'
                    : `${result.skipped} alumnos se omitieron porque ya estaban matriculados o fueron dados de baja.`}
                </Typography>
              )}
            </Box>
          )}
        </Box>

        <Box
          component="footer"
          sx={{ position: 'sticky', bottom: 0, bgcolor: 'background.paper', borderTop: 1, borderColor: 'divider', px: { xs: 2, md: 3 }, py: 1.5, display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-end', gap: 1.5 }}
        >
          {step === 0 && (
            <>
              <Button variant="outlined" onClick={onClose} sx={{ ...pill, borderColor: '#C5CCD8', color: '#3A4150' }}>
                Cancelar
              </Button>
              <Button variant="contained" color="secondary" disabled={chosen.length === 0} onClick={() => setStep(1)} sx={pill}>
                Siguiente
              </Button>
            </>
          )}
          {step === 1 && (
            <>
              <Button
                variant="outlined"
                onClick={() => {
                  reset();
                  setStep(0);
                }}
                sx={{ ...pill, borderColor: '#C5CCD8', color: '#3A4150' }}
              >
                Atrás
              </Button>
              <Button variant="contained" color="secondary" disabled={saving} onClick={confirm} sx={pill}>
                {chosen.length === 1 ? 'Confirmar 1 matrícula' : `Confirmar ${chosen.length} matrículas`}
              </Button>
            </>
          )}
          {step === 2 && (
            <Button variant="contained" color="secondary" onClick={onClose} sx={pill}>
              Cerrar
            </Button>
          )}
        </Box>
      </Box>
    </Dialog>
  );
}

function StepItem({ label, index, step }) {
  const done = index < step;
  const current = index === step;
  const dot = done
    ? { bgcolor: '#E8F5D6', color: '#2F5A08' }
    : current
      ? { bgcolor: colors.secondary, color: '#FFFFFF' }
      : { bgcolor: '#ECEFF3', color: '#4A5160' };
  return (
    <Box
      component="li"
      aria-current={current ? 'step' : undefined}
      sx={{ display: 'flex', alignItems: 'center', gap: 1.25, fontSize: 14, fontWeight: current ? 500 : 400, color: current ? colors.primary : done ? 'text.primary' : 'text.secondary' }}
    >
      <Box component="span" aria-hidden="true" sx={{ width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 500, ...dot }}>
        {done ? '✓' : index + 1}
      </Box>
      {label}
    </Box>
  );
}

function TableBox({ label, children }) {
  return (
    <Box sx={{ bgcolor: 'background.paper', border: 1, borderColor: 'divider', borderRadius: '16px', overflowX: 'auto' }}>
      <Box component="table" aria-label={label} sx={{ width: '100%', borderCollapse: 'collapse' }}>
        {children}
      </Box>
    </Box>
  );
}
