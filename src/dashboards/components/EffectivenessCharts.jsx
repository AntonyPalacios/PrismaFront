import { useState } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { errorDetail } from '../../app/api/errors';
import { colors } from '../../app/theme';
import { useGetAreaDistributionQuery, useGetCourseEffectivenessQuery } from '../api/dashboardsApi';
import { examLabel } from '../examLabel';
import ChartCard from './ChartCard';

// the prototype's lines: correct solid green, wrong dashed red, blank dotted grey
const CORRECT = { key: 'correct', label: 'Correctas', color: '#3F7A0C', width: 3 };
const WRONG = { key: 'wrong', label: 'Malas', color: '#C4141B', width: 2.5, dash: '6 3' };
const BLANK = { key: 'blank', label: 'Blanco', color: '#5A6170', width: 2, dash: '2 3' };
// one color per area (they differ in lightness too): correct solid, wrong dashed
const AREA_COLORS = [colors.secondary, '#B55F00'];

/**
 * "Efectividad por curso" (Claude Design: StudentChartsMobile,
 * REQ-DASHBOARDS-02): pick a course and see its correct, wrong and blank
 * answers exam after exam. Only the courses the student sat, each with the
 * exams that evaluated it (never a zero for an exam without that course).
 */
export function CourseEffectiveness({ studentId, includeAllCycles }) {
  const { currentData: courses = [], error } = useGetCourseEffectivenessQuery({ studentId, includeAllCycles });
  const [chosenId, setChosenId] = useState(null);
  const course = courses.find((c) => c.courseId === chosenId) ?? courses[0];

  if (error) return <Alert severity="error">{errorDetail(error)}</Alert>;
  if (!course) return null;
  const points = course.points.map((point) => ({ ...point, label: examLabel(point, includeAllCycles) }));

  return (
    <ChartCard
      id="course-effectiveness"
      title="Efectividad por curso"
      points={points}
      lines={[CORRECT, WRONG, BLANK]}
      toolbar={
        <Box role="group" aria-label="Curso" sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {courses.map((c) => (
            <Button
              key={c.courseId}
              size="small"
              variant={c.courseId === course.courseId ? 'contained' : 'outlined'}
              aria-pressed={c.courseId === course.courseId}
              onClick={() => setChosenId(c.courseId)}
              sx={{ borderRadius: '8px' }}
            >
              {c.courseName}
            </Button>
          ))}
        </Box>
      }
    >
      <caption>{course.courseName}</caption>
      <thead>
        <tr>
          <th scope="col">Examen</th>
          <th scope="col">Correctas</th>
          <th scope="col">Malas</th>
          <th scope="col">Blanco</th>
        </tr>
      </thead>
      <tbody>
        {points.map((point) => (
          <tr key={point.examId}>
            <th scope="row">{point.label}</th>
            <td>{point.correct}</td>
            <td>{point.wrong}</td>
            <td>{point.blank}</td>
          </tr>
        ))}
      </tbody>
    </ChartCard>
  );
}

/**
 * "Buenas y malas por área" and "Buenas y malas totales"
 * (REQ-DASHBOARDS-03): how many answers the student got right and wrong in
 * Lectura and in Matemática, and in the whole exam. Counts, not percentages.
 */
export function AreaDistribution({ studentId, includeAllCycles }) {
  const { currentData, error } = useGetAreaDistributionQuery({ studentId, includeAllCycles });
  const areas = currentData?.areas ?? [];
  const totals = (currentData?.totals ?? []).map((point) => ({ ...point, label: examLabel(point, includeAllCycles) }));

  if (error) return <Alert severity="error">{errorDetail(error)}</Alert>;
  if (totals.length === 0) return null;

  // one row per exam with each area's counts: { label, correct1, wrong1, correct2, wrong2 }
  const byArea = totals.map((total) => ({
    examId: total.examId,
    label: total.label,
    ...Object.fromEntries(
      areas.flatMap((area) => {
        const point = area.points.find((p) => p.examId === total.examId);
        return point ? [[`correct${area.areaId}`, point.correct], [`wrong${area.areaId}`, point.wrong]] : [];
      }),
    ),
  }));
  const areaLines = areas.flatMap((area, index) => {
    const color = AREA_COLORS[index % AREA_COLORS.length];
    return [
      { key: `correct${area.areaId}`, label: `${area.areaName} · buenas`, color, width: 3 },
      { key: `wrong${area.areaId}`, label: `${area.areaName} · malas`, color, width: 2, dash: '6 3' },
    ];
  });

  return (
    <>
      <ChartCard id="area-distribution" title="Buenas y malas por área" points={byArea} lines={areaLines}>
        <thead>
          <tr>
            <th scope="col">Examen</th>
            {areaLines.map((line) => (
              <th scope="col" key={line.key}>
                {line.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {byArea.map((row) => (
            <tr key={row.examId}>
              <th scope="row">{row.label}</th>
              {areaLines.map((line) => (
                <td key={line.key}>{row[line.key] ?? '—'}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </ChartCard>

      <ChartCard
        id="total-answers"
        title="Buenas y malas totales"
        points={totals}
        lines={[
          { ...CORRECT, label: 'Buenas' },
          { ...WRONG, label: 'Malas' },
        ]}
      >
        <thead>
          <tr>
            <th scope="col">Examen</th>
            <th scope="col">Buenas</th>
            <th scope="col">Malas</th>
          </tr>
        </thead>
        <tbody>
          {totals.map((point) => (
            <tr key={point.examId}>
              <th scope="row">{point.label}</th>
              <td>{point.correct}</td>
              <td>{point.wrong}</td>
            </tr>
          ))}
        </tbody>
      </ChartCard>
    </>
  );
}
