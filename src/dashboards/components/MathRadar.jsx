import { useState } from 'react';
import Box from '@mui/material/Box';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer, Tooltip } from 'recharts';
import { formatDate } from '../../academic/cycleDisplay';
import { colors } from '../../app/theme';
import { useGetMathRadarQuery } from '../api/dashboardsApi';

const visuallyHidden = { position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)', whiteSpace: 'nowrap' };
const CURRENT = { key: 'current', color: colors.primary };
const PREVIOUS = { key: 'previous', color: '#B55F00' };

const percentLabel = (axis) => (axis?.percent == null ? '—' : `${axis.correct} de ${axis.total} · ${Number(axis.percent)} %`);

/**
 * One row per Mathematics course of either exam (catalog order): the share
 * of correct answers in the latest exam and in the previous one. A course
 * not evaluated in one of them stays empty there, never 0.
 */
function radarRows(radar) {
  const byCourse = new Map();
  for (const key of ['current', 'previous']) {
    for (const axis of radar?.[key]?.axes ?? []) {
      const row = byCourse.get(axis.courseId) ?? { courseId: axis.courseId, courseName: axis.courseName };
      row[key] = axis.percent == null ? null : Number(axis.percent);
      row[`${key}Axis`] = axis;
      byCourse.set(axis.courseId, row);
    }
  }
  return [...byCourse.values()].sort((a, b) => a.courseId - b.courseId);
}

/**
 * "Balance en Matemática" (REQ-DASHBOARDS-04): the share of correct answers
 * per Mathematics course in the student's latest exam of the active cycle,
 * with the previous exam overlaid on request. Always the active cycle: the
 * section's "Incluir ciclos anteriores" does not apply here.
 */
export default function MathRadar({ studentId }) {
  const [compare, setCompare] = useState(false);
  const { data } = useGetMathRadarQuery(studentId);
  const current = data?.current ?? null;
  const previous = data?.previous ?? null;
  if (!current) return null; // the section already says when there are no results
  const rows = radarRows(data);
  const series = compare && previous ? [PREVIOUS, CURRENT] : [CURRENT];
  const examLabel = (exam) => `${exam.examName} · ${formatDate(exam.examDate)}`;

  return (
    <Box component="section" aria-labelledby="math-radar-title" sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
        <Box>
          <Typography id="math-radar-title" component="h3" sx={{ fontSize: 16, fontWeight: 500 }}>
            Balance en Matemática
          </Typography>
          <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
            % de buenas por curso · {examLabel(current)} ({current.examTypeName})
          </Typography>
        </Box>
        <FormControlLabel
          control={<Switch checked={compare} disabled={!previous} onChange={(e) => setCompare(e.target.checked)} />}
          label="Comparar con el anterior"
          labelPlacement="start"
          sx={{ m: 0, '& .MuiFormControlLabel-label': { fontSize: 14, color: 'text.secondary' } }}
        />
      </Box>
      {!previous && <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>Aún no hay un examen anterior en este ciclo para comparar.</Typography>}

      <Box aria-hidden="true" sx={{ width: '100%', height: { xs: 260, md: 300 } }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={rows} outerRadius="70%">
            <PolarGrid stroke="#E3E7EE" />
            <PolarAngleAxis dataKey="courseName" tick={{ fontSize: 11, fill: '#3A4150' }} />
            <PolarRadiusAxis domain={[0, 100]} tickCount={5} tick={{ fontSize: 10, fill: '#8C96A8' }} angle={90} />
            <Tooltip content={<RadarTooltip current={current} previous={compare ? previous : null} />} />
            {series.map((s) => (
              <Radar
                key={s.key}
                dataKey={s.key}
                stroke={s.color}
                fill={s.color}
                fillOpacity={s.key === 'current' ? 0.25 : 0.1}
                strokeWidth={2}
                strokeDasharray={s.key === 'previous' ? '5 4' : undefined}
                isAnimationActive={false}
              />
            ))}
          </RadarChart>
        </ResponsiveContainer>
      </Box>
      <Box component="ul" aria-hidden="true" sx={{ listStyle: 'none', m: 0, p: 0, display: 'flex', gap: 1.75, flexWrap: 'wrap' }}>
        {series.map((s) => (
          <Box component="li" key={s.key} sx={{ display: 'flex', alignItems: 'center', gap: 0.75, fontSize: 12, color: '#3A4150' }}>
            <svg width="18" height="4">
              <line x1="0" y1="2" x2="18" y2="2" stroke={s.color} strokeWidth={2} strokeDasharray={s.key === 'previous' ? '5 4' : undefined} />
            </svg>
            {examLabel(s.key === 'current' ? current : previous)}
          </Box>
        ))}
      </Box>

      {/* hidden on a div: a table ignores the 1px width and would widen the page */}
      <Box sx={visuallyHidden}>
        <table aria-labelledby="math-radar-title">
          <thead>
            <tr>
              <th scope="col">Curso</th>
              <th scope="col">{examLabel(current)}</th>
              {previous && <th scope="col">{examLabel(previous)}</th>}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.courseId}>
                <th scope="row">{row.courseName}</th>
                <td>{percentLabel(row.currentAxis)}</td>
                {previous && <td>{percentLabel(row.previousAxis)}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </Box>
    </Box>
  );
}

/** The course under the cursor: correct answers out of its questions, per exam shown. */
function RadarTooltip({ active, payload, current, previous }) {
  const row = active ? payload?.[0]?.payload : null;
  if (!row) return null;
  return (
    <Box sx={{ bgcolor: '#1A1C1E', color: '#FFFFFF', borderRadius: '8px', px: 1.25, py: 1, fontSize: 12, lineHeight: 1.5 }}>
      <Box sx={{ fontWeight: 500 }}>{row.courseName}</Box>
      <Box>
        {current.examName}: {percentLabel(row.currentAxis)}
      </Box>
      {previous && (
        <Box sx={{ color: '#C5CCD8' }}>
          {previous.examName}: {percentLabel(row.previousAxis)}
        </Box>
      )}
    </Box>
  );
}
