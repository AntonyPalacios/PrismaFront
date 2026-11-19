import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import CircularProgress from '@mui/material/CircularProgress';
import ListItemText from '@mui/material/ListItemText';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { formatShortDate } from '../../academic/cycleDisplay';
import { errorDetail } from '../../app/api/errors';
import { useGetTutorComparisonQuery } from '../api/dashboardsApi';

const ABOVE = { color: '#2F5A08', fontWeight: 500 };
const BELOW = { color: '#8E0F14', fontWeight: 500 };

/** Averages as whole numbers, rounded to the nearest one (7.5 → 8). */
const whole = (value) => (value == null ? null : Math.round(Number(value)));
const figure = (value) => (value == null ? '—' : String(whole(value)));

const cell = { px: 1.5, py: 1.25, whiteSpace: 'nowrap', fontSize: 14, textAlign: 'right', borderBottom: '1px solid #EEF1F5' };
const head = { ...cell, fontSize: 12, fontWeight: 500, color: 'text.secondary', borderBottom: '1px solid #E3E7EE' };
const first = { borderLeft: '1px solid #E3E7EE' };
const rowName = { ...cell, textAlign: 'left', color: '#3A4150', fontWeight: 400 };

/**
 * "Por tutor" (REQ-DASHBOARDS-06, ADMIN only): how each tutor's current
 * group did in the last 3 exams of the type, with the whole academy last as
 * the reference. Per exam: how many sat it and the average correct answers
 * of each area (wrong ones below, smaller); green above the academy's
 * average, red below. A tutor whose group did not sit an exam shows "—".
 * Every tutor shows by default; `hidden` holds the ones taken out with
 * "Tutores" (TutorsSelect). The academy row always stays.
 */
export default function TutorComparison({ examTypeId, hidden }) {
  const { currentData: data, isFetching, error } = useGetTutorComparisonQuery(examTypeId, { skip: !examTypeId });

  if (isFetching && !data) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <CircularProgress size={32} aria-label="Cargando comparativa de tutores" />
      </Box>
    );
  }
  if (error) return <Alert severity="error">{errorDetail(error)}</Alert>;
  if (!data) return null;
  if (data.exams.length === 0) {
    return (
      <Typography sx={{ py: 4, textAlign: 'center', color: 'text.secondary' }}>
        Aún no hay resultados de este tipo de examen en el ciclo activo.
      </Typography>
    );
  }

  // the areas in catalog order, as the academy's cells bring them
  const areas = [...new Map(data.academy.flatMap((c) => c.areas).map((a) => [a.areaId, a])).values()].sort((a, b) => a.areaId - b.areaId);
  const academyOf = (examId) => data.academy.find((c) => c.examId === examId);
  const rows = [
    ...data.tutors.filter((tutor) => !hidden.has(tutor.tutorId)).map((tutor) => ({ key: tutor.tutorId, name: tutor.tutorName, cells: tutor.cells, academy: false })),
    { key: 'academy', name: 'Toda la academia', cells: data.academy, academy: true },
  ];

  return (
    <>
      <Box sx={{ bgcolor: 'background.paper', border: 1, borderColor: 'divider', borderRadius: '16px', overflowX: 'auto' }}>
        <Box component="table" aria-label="Comparativa de tutores" sx={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <Box component="th" scope="col" rowSpan={2} sx={{ ...head, textAlign: 'left', verticalAlign: 'bottom' }}>
                Tutor
              </Box>
              {data.exams.map((exam) => (
                <Box
                  component="th"
                  scope="colgroup"
                  colSpan={areas.length + 1}
                  key={exam.examId}
                  sx={{ ...head, ...first, textAlign: 'center', color: 'text.primary', fontSize: 13, borderBottom: 0 }}
                >
                  {exam.examName} · {formatShortDate(exam.examDate)}
                </Box>
              ))}
            </tr>
            <tr>
              {data.exams.map((exam) => [
                <Box component="th" scope="col" key={`${exam.examId}-n`} sx={{ ...head, ...first }}>
                  Alumnos
                </Box>,
                ...areas.map((area) => (
                  <Box component="th" scope="col" key={`${exam.examId}-${area.areaId}`} sx={head}>
                    {area.areaName}
                  </Box>
                )),
              ])}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <Box component="tr" key={row.key} sx={row.academy ? { bgcolor: '#F4F6FA' } : null}>
                <Box component="th" scope="row" sx={{ ...rowName, ...(row.academy && { fontWeight: 500, color: '#002F6C' }) }}>
                  {row.name}
                </Box>
                {data.exams.map((exam) => {
                  const mine = row.cells.find((c) => c.examId === exam.examId);
                  const reference = academyOf(exam.examId);
                  return [
                    <Box component="td" key={`${exam.examId}-n`} sx={{ ...cell, ...first, color: 'text.secondary' }}>
                      {mine ? mine.students : '—'}
                    </Box>,
                    ...areas.map((area) => {
                      const value = mine?.areas.find((a) => a.areaId === area.areaId);
                      const academyValue = reference?.areas.find((a) => a.areaId === area.areaId);
                      let sx = null;
                      // the rounded figures: a tutor showing the academy's number is not above or below it
                      if (!row.academy && value && academyValue && whole(value.correctAvg) !== whole(academyValue.correctAvg)) {
                        sx = whole(value.correctAvg) > whole(academyValue.correctAvg) ? ABOVE : BELOW;
                      }
                      return (
                        <Box component="td" key={`${exam.examId}-${area.areaId}`} sx={{ ...cell, ...sx }}>
                          {value ? figure(value.correctAvg) : '—'}
                          {value && (
                            <Box component="span" sx={{ display: 'block', fontSize: 11, fontWeight: 400, color: 'text.secondary' }}>
                              {figure(value.wrongAvg)} malas
                            </Box>
                          )}
                        </Box>
                      );
                    }),
                  ];
                })}
              </Box>
            ))}
          </tbody>
        </Box>
      </Box>
      <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
        Promedio de buenas por área (y de malas debajo) del grupo actual de cada tutor en los últimos 3 exámenes del ciclo activo.
        En verde, sobre el promedio de la academia; en rojo, debajo. Quien no asistió no cuenta.
      </Typography>
    </>
  );
}

const ALL_TUTORS = 'all';

/**
 * "Tutores" (multiple select with checkboxes): which tutors "Por tutor"
 * shows, all of them by default, with "Todos" to check or clear them at
 * once. It reads the same comparison the table does (one request).
 */
export function TutorsSelect({ examTypeId, hidden, onChange }) {
  const { currentData: data } = useGetTutorComparisonQuery(examTypeId, { skip: !examTypeId });
  const tutors = data?.tutors ?? [];
  const shown = tutors.filter((tutor) => !hidden.has(tutor.tutorId)).map((tutor) => tutor.tutorId);
  const allShown = shown.length === tutors.length;

  const describe = (selected) => {
    if (selected.length === tutors.length) return 'Todos';
    if (selected.length === 0) return 'Ninguno';
    if (selected.length <= 2) return tutors.filter((t) => selected.includes(t.tutorId)).map((t) => t.tutorName).join('; ');
    return `${selected.length} de ${tutors.length} tutores`;
  };

  const change = (event) => {
    const picked = event.target.value;
    if (picked.includes(ALL_TUTORS)) {
      onChange(allShown ? new Set(tutors.map((t) => t.tutorId)) : new Set());
    } else {
      onChange(new Set(tutors.filter((t) => !picked.includes(t.tutorId)).map((t) => t.tutorId)));
    }
  };

  return (
    <TextField
      select
      size="small"
      label="Tutores"
      value={shown}
      onChange={change}
      disabled={tutors.length === 0}
      slotProps={{ inputLabel: { shrink: true }, select: { multiple: true, displayEmpty: true, renderValue: describe } }}
    >
      <MenuItem value={ALL_TUTORS} dense>
        <Checkbox size="small" checked={allShown} indeterminate={!allShown && shown.length > 0} />
        <ListItemText primary="Todos" />
      </MenuItem>
      {tutors.map((tutor) => (
        <MenuItem key={tutor.tutorId} value={tutor.tutorId} dense>
          <Checkbox size="small" checked={!hidden.has(tutor.tutorId)} />
          <ListItemText primary={tutor.tutorName} />
        </MenuItem>
      ))}
    </TextField>
  );
}
