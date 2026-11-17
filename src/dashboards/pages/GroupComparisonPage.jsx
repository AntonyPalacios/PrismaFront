import { useState } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { formatShortDate } from '../../academic/cycleDisplay';
import { errorDetail } from '../../app/api/errors';
import { useGetExamTypesQuery } from '../../catalog/api/examTypesApi';
import { useGetMeQuery, useIsAdmin } from '../../users/api/authApi';
import { useGetUsersQuery } from '../../users/api/usersApi';
import { userFullName } from '../../users/userDisplay';
import { useGetGroupComparisonQuery } from '../api/dashboardsApi';
import TutorComparison from '../components/TutorComparison';

const selectProps = { select: true, size: 'small', slotProps: { select: { native: true }, inputLabel: { shrink: true } } };
const UP = { color: '#2F5A08', fontWeight: 500 };
const DOWN = { color: '#8E0F14', fontWeight: 500 };

/** Averages as whole numbers, rounded to the nearest one (7.5 → 8). */
const whole = (value) => (value == null ? null : Math.round(Number(value)));
const figure = (value) => (value == null ? '—' : String(whole(value)));

/**
 * How an average moved against the previous exam: ▲ or ▼, green when it is
 * good news (more correct answers, fewer wrong ones) and red otherwise.
 * Compares the rounded figures, so two equal numbers on screen never differ.
 */
function trend(exams, index, read, moreIsBetter) {
  const now = whole(read(exams[index]));
  const before = index > 0 ? whole(read(exams[index - 1])) : null;
  if (now == null || before == null || now === before) return { text: figure(now), sx: null };
  const rose = now > before;
  return { text: `${figure(now)} ${rose ? '▲' : '▼'}`, sx: rose === moreIsBetter ? UP : DOWN };
}

/**
 * "Charla de notas" (Claude Design: GroupComparisonDesktop,
 * REQ-DASHBOARDS-05): for an exam type, how the group did in each exam of
 * the active cycle — per area, the average, lowest and highest count of
 * correct and of wrong answers; per course, the average of correct ones. A
 * TUTOR always sees their own students; an ADMIN the whole academy, or the
 * group of the tutor they pick. Only ADMIN and TUTOR. An ADMIN also has the
 * "Por tutor" tab (REQ-DASHBOARDS-06): every tutor's group side by side in
 * the last 3 exams, against the academy.
 */
export default function GroupComparisonPage() {
  const { data: me } = useGetMeQuery();
  const isAdmin = useIsAdmin();
  const allowed = Boolean(me?.roles?.some((role) => role === 'ADMIN' || role === 'TUTOR'));
  const { data: types = [] } = useGetExamTypesQuery(undefined, { skip: !allowed });
  const [chosenTypeId, setChosenTypeId] = useState(null);
  const [tutorId, setTutorId] = useState('');
  // 'group' (the charla de notas) or 'tutors' (an admin's comparison)
  const [view, setView] = useState('group');
  const byTutor = isAdmin && view === 'tutors';
  const examTypeId = chosenTypeId ?? types[0]?.id;
  const { currentData: exams, isFetching, error } = useGetGroupComparisonQuery(
    { examTypeId, tutorId: isAdmin && tutorId ? Number(tutorId) : undefined },
    { skip: !allowed || !examTypeId || byTutor },
  );

  if (me && !allowed) {
    return <Alert severity="info">La charla de notas es solo para administradores y tutores.</Alert>;
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, maxWidth: 1180 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        <Typography component="h1" sx={{ fontSize: { xs: 22, md: 28 }, fontWeight: 500 }}>
          Charla de notas
        </Typography>
        <Typography sx={{ fontSize: 14, color: 'text.secondary' }}>
          {isAdmin
            ? '¿El grupo está mejorando? Promedio, mínimo y máximo por área en cada examen del ciclo activo.'
            : '¿Tu grupo está mejorando? Promedio, mínimo y máximo por área de tus alumnos en cada examen del ciclo activo.'}
        </Typography>
      </Box>

      {isAdmin && (
        <Tabs value={view} onChange={(_, value) => setView(value)} aria-label="Vista de la charla de notas" sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab value="group" label="Por grupo" />
          <Tab value="tutors" label="Por tutor" />
        </Tabs>
      )}

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 280px))' },
          gap: 2,
          p: 2,
          bgcolor: 'background.paper',
          border: 1,
          borderColor: 'divider',
          borderRadius: '16px',
        }}
      >
        <TextField {...selectProps} label="Tipo de examen" value={examTypeId ?? ''} onChange={(e) => setChosenTypeId(Number(e.target.value))}>
          {types.map((type) => (
            <option key={type.id} value={type.id}>
              {type.name}
            </option>
          ))}
        </TextField>
        {isAdmin && !byTutor && <TutorSelect value={tutorId} onChange={setTutorId} />}
      </Box>

      {byTutor && <TutorComparison examTypeId={examTypeId} />}
      {!byTutor && isFetching && !exams && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress size={32} aria-label="Cargando charla de notas" />
        </Box>
      )}
      {!byTutor && error && <Alert severity="error">{errorDetail(error)}</Alert>}
      {!byTutor && exams && exams.length === 0 && (
        <Typography sx={{ py: 4, textAlign: 'center', color: 'text.secondary' }}>
          {isAdmin && !tutorId
            ? 'Aún no hay resultados de este tipo de examen en el ciclo activo.'
            : 'El grupo aún no tiene resultados de este tipo de examen en el ciclo activo.'}
        </Typography>
      )}
      {!byTutor && exams && exams.length > 0 && (
        <>
          <GroupTable exams={exams} />
          <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
            ▲▼ comparan el promedio contra el examen anterior. Solo aparecen los exámenes con resultados del grupo; quien no
            asistió no cuenta.
          </Typography>
        </>
      )}
    </Box>
  );
}

/** ADMIN only: the whole academy, or one active tutor's group. */
function TutorSelect({ value, onChange }) {
  const { data: users = [] } = useGetUsersQuery();
  const tutors = users.filter((user) => user.active && user.roles.includes('TUTOR'));
  return (
    <TextField {...selectProps} label="Tutor" value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="">Toda la academia</option>
      {tutors.map((tutor) => (
        <option key={tutor.id} value={tutor.id}>
          {userFullName(tutor)}
        </option>
      ))}
    </TextField>
  );
}

const cell = { px: 1.75, py: 1.25, whiteSpace: 'nowrap', fontSize: 14, textAlign: 'right', borderBottom: '1px solid #EEF1F5' };
const head = { ...cell, fontSize: 12, fontWeight: 500, color: 'text.secondary', borderBottom: 0 };
const first = { borderLeft: '1px solid #E3E7EE' };
const label = { ...cell, textAlign: 'left', color: '#3A4150', fontWeight: 400 };
const band = { ...cell, textAlign: 'left', fontWeight: 500, color: '#002F6C', bgcolor: '#F4F6FA' };

/** One pair of columns (Buenas, Malas) per exam; a block of rows per area, then the courses. */
function GroupTable({ exams }) {
  // every area and course some exam brings, in catalog order
  const areas = [...new Map(exams.flatMap((exam) => exam.areas).map((area) => [area.areaId, area])).values()].sort((a, b) => a.areaId - b.areaId);
  const courses = [...new Map(exams.flatMap((exam) => exam.courses).map((course) => [course.courseId, course])).values()].sort(
    (a, b) => a.courseId - b.courseId,
  );
  const areaOf = (exam, areaId) => exam.areas.find((area) => area.areaId === areaId);
  const columns = 1 + exams.length * 2;

  return (
    <Box sx={{ bgcolor: 'background.paper', border: 1, borderColor: 'divider', borderRadius: '16px', overflowX: 'auto' }}>
      <Box component="table" aria-label="Charla de notas" sx={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <Box component="th" scope="col" rowSpan={2} sx={{ ...head, textAlign: 'left', verticalAlign: 'bottom', borderBottom: '1px solid #E3E7EE' }}>
              Área / estadístico
            </Box>
            {exams.map((exam) => (
              <Box component="th" scope="colgroup" colSpan={2} key={exam.examId} sx={{ ...head, ...first, textAlign: 'center', color: 'text.primary', fontSize: 13 }}>
                {exam.examName} · {formatShortDate(exam.examDate)}
                <Box component="span" sx={{ display: 'block', fontSize: 12, fontWeight: 400, color: 'text.secondary' }}>
                  {exam.students} {exam.students === 1 ? 'alumno' : 'alumnos'}
                </Box>
              </Box>
            ))}
          </tr>
          <tr>
            {exams.map((exam) => [
              <Box component="th" scope="col" key={`${exam.examId}-c`} sx={{ ...head, ...first, borderBottom: '1px solid #E3E7EE' }}>
                Buenas
              </Box>,
              <Box component="th" scope="col" key={`${exam.examId}-w`} sx={{ ...head, borderBottom: '1px solid #E3E7EE' }}>
                Malas
              </Box>,
            ])}
          </tr>
        </thead>
        <tbody>
          {areas.map((area) => [
            <tr key={`area-${area.areaId}`}>
              <Box component="th" scope="rowgroup" colSpan={columns} sx={band}>
                {area.areaName}
              </Box>
            </tr>,
            <tr key={`avg-${area.areaId}`}>
              <Box component="th" scope="row" sx={label}>
                Promedio
              </Box>
              {exams.map((exam, index) => {
                const correct = trend(exams, index, (e) => areaOf(e, area.areaId)?.correctAvg, true);
                const wrong = trend(exams, index, (e) => areaOf(e, area.areaId)?.wrongAvg, false);
                return [
                  <Box component="td" key={`${exam.examId}-c`} sx={{ ...cell, ...first, ...correct.sx }}>
                    {correct.text}
                  </Box>,
                  <Box component="td" key={`${exam.examId}-w`} sx={{ ...cell, ...wrong.sx }}>
                    {wrong.text}
                  </Box>,
                ];
              })}
            </tr>,
            ...[
              ['Mínimo', 'correctMin', 'wrongMin'],
              ['Máximo', 'correctMax', 'wrongMax'],
            ].map(([name, correctKey, wrongKey]) => (
              <tr key={`${name}-${area.areaId}`}>
                <Box component="th" scope="row" sx={label}>
                  {name}
                </Box>
                {exams.map((exam) => [
                  <Box component="td" key={`${exam.examId}-c`} sx={{ ...cell, ...first }}>
                    {figure(areaOf(exam, area.areaId)?.[correctKey])}
                  </Box>,
                  <Box component="td" key={`${exam.examId}-w`} sx={cell}>
                    {figure(areaOf(exam, area.areaId)?.[wrongKey])}
                  </Box>,
                ])}
              </tr>
            )),
          ])}
          {courses.length > 0 && (
            <tr>
              <Box component="th" scope="rowgroup" colSpan={columns} sx={band}>
                Promedio de buenas por curso
              </Box>
            </tr>
          )}
          {courses.map((course) => (
            <tr key={`course-${course.courseId}`}>
              <Box component="th" scope="row" sx={label}>
                {course.courseName}
              </Box>
              {exams.map((exam, index) => {
                // a course the exam did not evaluate has no figure: never a zero
                const average = trend(exams, index, (e) => e.courses.find((c) => c.courseId === course.courseId)?.correctAvg, true);
                return [
                  <Box component="td" key={`${exam.examId}-c`} sx={{ ...cell, ...first, ...average.sx }}>
                    {average.text}
                  </Box>,
                  <Box component="td" key={`${exam.examId}-w`} aria-hidden="true" sx={{ ...cell, color: 'text.disabled' }} />,
                ];
              })}
            </tr>
          ))}
        </tbody>
      </Box>
    </Box>
  );
}
