import { useState } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { formatShortDate, todayIso } from '../../academic/cycleDisplay';
import { errorDetail } from '../../app/api/errors';
import { useNotify } from '../../app/notifyContext';
import { useGetMeQuery, useIsAdmin } from '../../users/api/authApi';
import { useGetUsersQuery } from '../../users/api/usersApi';
import { userFullName } from '../../users/userDisplay';
import { useGetGoalMockExamsQuery, useGetGoalSheetQuery, useSaveGoalSheetMutation } from '../api/goalsApi';
import { GoalOutcome } from '../components/GoalOutcome';

const selectProps = { select: true, size: 'small', slotProps: { select: { native: true }, inputLabel: { shrink: true } } };
const cell = { px: 1.5, py: 1, borderBottom: '1px solid #EEF1F5', fontSize: 14, verticalAlign: 'top' };
const head = { ...cell, fontSize: 12, fontWeight: 500, color: 'text.secondary', textAlign: 'left', whiteSpace: 'nowrap', borderBottom: '1px solid #E3E7EE' };

const keyOf = (row, areaId) => `${row.enrollmentId}:${areaId}`;
const asText = (value) => (value == null ? '' : String(value));
const isWhole = (text) => text === '' || /^\d{1,3}$/.test(text.trim());

/** Why a student can't get a goal in this mock exam. */
function noExamText(row) {
  return row.noExamReason === 'EXAM_TYPE_MISSING'
    ? `Este simulacro no tiene ${row.examTypeName}.`
    : 'Sin tipo de examen: asígnale una carrera en su matrícula.';
}

/** The next mock exam from today; with none ahead, the last one. */
function defaultMockExam(mockExams) {
  const today = todayIso();
  return (mockExams.find((m) => m.examDate >= today) ?? mockExams.at(-1))?.id;
}

/**
 * "Metas" (REQ-GOALS-01, agreements of 2026-11-17): the goals of correct
 * answers per area of a whole group for one mock exam of the active
 * cycle, as the academy's "METAS" sheets. Empty goals come filled with the
 * suggestion (last attended exam + 2), ready to accept or change; one
 * "Guardar metas" saves the group, all or nothing. Once the exam has
 * results, each goal shows the actual correct answers and whether it was
 * met. A tutor works with their own students; an admin picks the tutor.
 */
export default function GoalsPage() {
  const notify = useNotify();
  const { data: me } = useGetMeQuery();
  const isAdmin = useIsAdmin();
  const allowed = Boolean(me?.roles?.some((role) => role === 'ADMIN' || role === 'TUTOR'));
  const { data: mockExams = [], isLoading: loadingMockExams } = useGetGoalMockExamsQuery(undefined, { skip: !allowed });
  const [chosenMockExamId, setChosenMockExamId] = useState(null);
  const [tutorId, setTutorId] = useState('');
  // what was typed, by "enrollmentId:areaId"; the rest shows the saved goal or the suggestion
  const [edits, setEdits] = useState({});
  const mockExamId = chosenMockExamId ?? defaultMockExam(mockExams);
  const {
    currentData: sheet,
    isFetching,
    error,
  } = useGetGoalSheetQuery(
    { mockExamId, tutorId: isAdmin && tutorId ? Number(tutorId) : undefined },
    { skip: !allowed || !mockExamId },
  );
  const [saveGoalSheet, { isLoading: saving, error: saveError, reset }] = useSaveGoalSheetMutation();

  if (me && !allowed) {
    return <Alert severity="info">Las metas son solo para administradores y tutores.</Alert>;
  }

  const rows = sheet?.rows ?? [];
  const settable = rows.filter((row) => row.examId != null);
  const valueOf = (row, goal) => edits[keyOf(row, goal.areaId)] ?? asText(goal.target ?? goal.suggested);
  // what would change: a typed or suggested value that differs from the saved goal
  const changes = settable.flatMap((row) =>
    row.goals
      .filter((goal) => valueOf(row, goal).trim() !== asText(goal.target))
      .map((goal) => ({ row, goal, text: valueOf(row, goal).trim() })),
  );
  const invalid = changes.some((change) => !isWhole(change.text));

  const startOver = () => {
    setEdits({});
    reset();
  };

  const save = async () => {
    try {
      await saveGoalSheet({
        mockExamId,
        goals: changes.map(({ row, goal, text }) => ({
          enrollmentId: row.enrollmentId,
          areaId: goal.areaId,
          targetCorrect: text === '' ? null : Number(text),
        })),
      }).unwrap();
      setEdits({});
      notify('Metas guardadas.');
    } catch {
      // the alert shows the backend's message; what was typed stays
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, maxWidth: 1180 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        <Typography component="h1" sx={{ fontSize: { xs: 22, md: 28 }, fontWeight: 500 }}>
          Metas
        </Typography>
        <Typography sx={{ fontSize: 14, color: 'text.secondary' }}>
          Meta de buenas por área para cada alumno en un simulacro. Las vacías vienen con la sugerida: buenas del último examen
          rendido + 2.
        </Typography>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 320px))' },
          gap: 2,
          p: 2,
          bgcolor: 'background.paper',
          border: 1,
          borderColor: 'divider',
          borderRadius: '16px',
        }}
      >
        <TextField
          {...selectProps}
          label="Simulacro"
          value={mockExamId ?? ''}
          onChange={(e) => {
            setChosenMockExamId(Number(e.target.value));
            startOver();
          }}
          disabled={mockExams.length === 0}
        >
          {mockExams.length === 0 && <option value="">Sin simulacros en el ciclo activo</option>}
          {mockExams.map((m) => (
            <option key={m.id} value={m.id}>
              {`${m.name} · ${formatShortDate(m.examDate)} · ${m.stageName}`}
            </option>
          ))}
        </TextField>
        {isAdmin && (
          <TutorSelect
            value={tutorId}
            onChange={(value) => {
              setTutorId(value);
              startOver();
            }}
          />
        )}
      </Box>

      {!loadingMockExams && mockExams.length === 0 && (
        <Typography sx={{ py: 4, textAlign: 'center', color: 'text.secondary' }}>
          El ciclo activo aún no tiene simulacros. Créalos en "Exámenes".
        </Typography>
      )}
      {isFetching && !sheet && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress size={32} aria-label="Cargando metas" />
        </Box>
      )}
      {error && <Alert severity="error">{errorDetail(error)}</Alert>}
      {sheet && rows.length === 0 && (
        <Typography sx={{ py: 4, textAlign: 'center', color: 'text.secondary' }}>
          No hay alumnos matriculados en la etapa vigente para este grupo.
        </Typography>
      )}

      {sheet && rows.length > 0 && (
        <>
          {saveError && <Alert severity="error">{errorDetail(saveError)}</Alert>}
          <Box sx={{ bgcolor: 'background.paper', border: 1, borderColor: 'divider', borderRadius: '16px', overflowX: 'auto' }}>
            <Box component="table" aria-label="Metas del grupo" sx={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <Box component="th" scope="col" sx={head}>
                    Alumno
                  </Box>
                  <Box component="th" scope="col" sx={head}>
                    Examen
                  </Box>
                  {sheet.areas.map((area) => (
                    <Box component="th" scope="col" key={area.areaId} sx={head}>
                      {`Meta ${area.areaName}`}
                    </Box>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.enrollmentId}>
                    <Box component="th" scope="row" sx={{ ...cell, textAlign: 'left', fontWeight: 500 }}>
                      {row.fullName}
                      {isAdmin && !tutorId && (
                        <Box component="span" sx={{ display: 'block', fontSize: 12, fontWeight: 400, color: 'text.secondary' }}>
                          {row.tutorName ?? 'Sin tutor'}
                        </Box>
                      )}
                    </Box>
                    <Box component="td" sx={{ ...cell, whiteSpace: 'nowrap' }}>
                      {row.examId == null ? (
                        <Box component="span" sx={{ fontSize: 13, color: '#7A4100', whiteSpace: 'normal' }}>
                          {noExamText(row)}
                        </Box>
                      ) : (
                        <>
                          {row.examTypeName}
                          {row.attended === false && (
                            <Box component="span" sx={{ display: 'block', fontSize: 12, color: 'text.secondary' }}>
                              No asistió
                            </Box>
                          )}
                        </>
                      )}
                    </Box>
                    {row.goals.map((goal) => {
                      const area = sheet.areas.find((a) => a.areaId === goal.areaId);
                      // without an exam there is nothing to set: no value, no hint
                      const blocked = row.examId == null;
                      const text = blocked ? '' : valueOf(row, goal);
                      const wrong = !isWhole(text);
                      const fromSuggestion =
                        !blocked && goal.target == null && edits[keyOf(row, goal.areaId)] == null && goal.suggested != null;
                      return (
                        <Box component="td" key={goal.areaId} sx={{ ...cell, minWidth: 150 }}>
                          <TextField
                            size="small"
                            value={text}
                            disabled={blocked}
                            onChange={(e) => setEdits((current) => ({ ...current, [keyOf(row, goal.areaId)]: e.target.value }))}
                            error={wrong}
                            slotProps={{ htmlInput: { inputMode: 'numeric', 'aria-label': `Meta de ${area?.areaName} de ${row.fullName}` } }}
                            sx={{ width: 96 }}
                          />
                          <Box sx={{ fontSize: 12, color: wrong ? 'error.main' : 'text.secondary', mt: 0.5 }}>
                            {wrong && 'Entero de 0 a 999'}
                            {!wrong && fromSuggestion && `Sugerida (${goal.basedOnExamName} + 2)`}
                            {!wrong && !fromSuggestion && goal.suggested != null && goal.target != null && `Sugerida: ${goal.suggested}`}
                          </Box>
                          {row.attended === true && goal.target != null && <GoalOutcome target={goal.target} actual={goal.actual} />}
                        </Box>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'flex-end', gap: 1.5 }}>
            <Typography sx={{ flex: '1 1 260px', fontSize: 13, color: 'text.secondary' }}>
              Una meta vacía no se guarda; borrar una ya guardada la quita.
            </Typography>
            <Button variant="outlined" onClick={startOver} disabled={saving || Object.keys(edits).length === 0} sx={{ height: 44 }}>
              Descartar cambios
            </Button>
            <Button
              variant="contained"
              color="secondary"
              onClick={save}
              disabled={saving || invalid || changes.length === 0}
              sx={{ height: 44, minWidth: 160 }}
            >
              Guardar metas
            </Button>
          </Box>
        </>
      )}
    </Box>
  );
}

function TutorSelect({ value, onChange }) {
  const { data: users = [] } = useGetUsersQuery();
  const tutors = users.filter((user) => user.active && user.roles.includes('TUTOR'));
  return (
    <TextField {...selectProps} label="Tutor" value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="">Todos los tutores</option>
      {tutors.map((tutor) => (
        <option key={tutor.id} value={tutor.id}>
          {userFullName(tutor)}
        </option>
      ))}
    </TextField>
  );
}
