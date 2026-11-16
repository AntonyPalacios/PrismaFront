import { useState } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { formatDate } from '../../academic/cycleDisplay';
import { errorDetail } from '../../app/api/errors';
import { colors } from '../../app/theme';
import { useGetScoreEvolutionQuery } from '../api/dashboardsApi';

// the prototype's lines: the student solid, the exam's range dashed
const STUDENT = { key: 'studentScore', label: 'Alumno', color: colors.primary, width: 3 };
const MAX = { key: 'examMax', label: 'Máx. del examen', color: '#B55F00', width: 2, dash: '5 4' };
const MIN = { key: 'examMin', label: 'Mín. del examen', color: '#5A6170', width: 2, dash: '2 4' };
const AREA_LINES = [
  { color: colors.secondary, width: 3 },
  { color: '#3F7A0C', width: 2.5, dash: '6 3' },
];

const visuallyHidden = { position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)', whiteSpace: 'nowrap' };

/** "3° de 54": the student's position among everyone who sat the exam. */
const meritLabel = (point) => `${point.merit}° de ${point.meritOf}`;

/**
 * "Progreso" of a student (Claude Design: StudentChartsMobile,
 * REQ-DASHBOARDS-01): the total score exam after exam against the highest
 * and lowest of each exam, with the merit in the tooltip, and apart the
 * Lectura and Matemática scores. Only the active cycle unless "Incluir
 * ciclos anteriores". Each chart has a table for screen readers.
 */
export default function ProgressSection({ student }) {
  const [includeAllCycles, setIncludeAllCycles] = useState(false);
  const { currentData, isFetching, error } = useGetScoreEvolutionQuery({ studentId: student.id, includeAllCycles });
  const points = (currentData ?? []).map((point) => ({
    ...point,
    // names repeat every cycle: with several cycles the label says which
    label: includeAllCycles ? `${point.examName} · ${point.cycleName}` : point.examName,
    ...Object.fromEntries(point.areaScores.map((area) => [`area${area.areaId}`, area.score])),
  }));
  const areas = points[0]?.areaScores ?? [];
  const gained = points.length > 1 ? points[points.length - 1].studentScore - points[0].studentScore : null;

  return (
    <Box
      component="section"
      aria-labelledby="student-progress-title"
      sx={{ bgcolor: 'background.paper', border: 1, borderColor: 'divider', borderRadius: '16px', p: 2.5, display: 'flex', flexDirection: 'column', gap: 2 }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap' }}>
        <Typography id="student-progress-title" component="h2" sx={{ fontSize: 18, fontWeight: 500 }}>
          Progreso
        </Typography>
        <FormControlLabel
          control={<Switch checked={includeAllCycles} onChange={(e) => setIncludeAllCycles(e.target.checked)} />}
          label="Incluir ciclos anteriores"
          labelPlacement="start"
          sx={{ m: 0, '& .MuiFormControlLabel-label': { fontSize: 14, color: 'text.secondary' } }}
        />
      </Box>

      {isFetching && !currentData && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress size={28} aria-label="Cargando progreso" />
        </Box>
      )}
      {error && <Alert severity="error">{errorDetail(error)}</Alert>}
      {currentData && points.length === 0 && (
        <Typography sx={{ py: 2, textAlign: 'center', color: 'text.secondary' }}>
          {includeAllCycles ? 'Aún no tiene resultados de exámenes.' : 'Aún no tiene resultados de exámenes en el ciclo activo.'}
        </Typography>
      )}

      {points.length > 0 && (
        <>
          <Chart
            id="score-evolution"
            title="Evolución del puntaje"
            aside={gained === null ? null : `${gained >= 0 ? '+' : '−'}${Math.abs(gained).toFixed(2).replace(/\.?0+$/, '')} pts`}
            asideColor={gained >= 0 ? '#2F5A08' : colors.danger}
            points={points}
            lines={[MAX, MIN, STUDENT]}
            tooltip={<EvolutionTooltip />}
          >
            <thead>
              <tr>
                <th scope="col">Examen</th>
                <th scope="col">Fecha</th>
                <th scope="col">Puntaje</th>
                <th scope="col">Mérito</th>
                <th scope="col">Máximo del examen</th>
                <th scope="col">Mínimo del examen</th>
              </tr>
            </thead>
            <tbody>
              {points.map((point) => (
                <tr key={point.examId}>
                  <th scope="row">{point.label}</th>
                  <td>{formatDate(point.examDate)}</td>
                  <td>{point.studentScore}</td>
                  <td>{meritLabel(point)}</td>
                  <td>{point.examMax}</td>
                  <td>{point.examMin}</td>
                </tr>
              ))}
            </tbody>
          </Chart>

          <Chart
            id="area-scores"
            title="Lectura y Matemática"
            points={points}
            lines={areas.map((area, index) => ({ key: `area${area.areaId}`, label: area.areaName, ...AREA_LINES[index % AREA_LINES.length] }))}
          >
            <thead>
              <tr>
                <th scope="col">Examen</th>
                {areas.map((area) => (
                  <th scope="col" key={area.areaId}>
                    {area.areaName}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {points.map((point) => (
                <tr key={point.examId}>
                  <th scope="row">{point.label}</th>
                  {point.areaScores.map((area) => (
                    <td key={area.areaId}>{area.score}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </Chart>
        </>
      )}
    </Box>
  );
}

/** A line chart with its legend; `children` is the same data as table rows, for screen readers. */
function Chart({ id, title, aside, asideColor, points, lines, tooltip, children }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 1 }}>
        <Typography id={`${id}-title`} component="h3" sx={{ fontSize: 16, fontWeight: 500 }}>
          {title}
        </Typography>
        {aside && <Typography sx={{ fontSize: 13, fontWeight: 500, color: asideColor }}>{aside}</Typography>}
      </Box>
      <Box aria-hidden="true" sx={{ width: '100%', height: { xs: 200, md: 260 } }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={points} margin={{ top: 8, right: 12, bottom: 0, left: -12 }}>
            <CartesianGrid stroke="#E3E7EE" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#5A6170' }} tickLine={false} axisLine={{ stroke: '#E3E7EE' }} interval="preserveStartEnd" />
            <YAxis domain={['auto', 'auto']} tick={{ fontSize: 11, fill: '#5A6170' }} tickLine={false} axisLine={false} />
            <Tooltip content={tooltip} />
            {lines.map((line) => (
              <Line
                key={line.key}
                type="linear"
                dataKey={line.key}
                name={line.label}
                stroke={line.color}
                strokeWidth={line.width}
                strokeDasharray={line.dash}
                dot={line.dash ? false : { r: 4, fill: line.color }}
                isAnimationActive={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </Box>
      <Box component="ul" aria-hidden="true" sx={{ listStyle: 'none', m: 0, p: 0, display: 'flex', gap: 1.75, flexWrap: 'wrap' }}>
        {lines.map((line) => (
          <Box component="li" key={line.key} sx={{ display: 'flex', alignItems: 'center', gap: 0.75, fontSize: 12, color: '#3A4150' }}>
            <svg width="18" height="4">
              <line x1="0" y1="2" x2="18" y2="2" stroke={line.color} strokeWidth={line.width} strokeDasharray={line.dash} />
            </svg>
            {line.label}
          </Box>
        ))}
      </Box>
      <Box component="table" aria-labelledby={`${id}-title`} sx={visuallyHidden}>
        {children}
      </Box>
    </Box>
  );
}

/** The point under the cursor: exam, date, score with merit, and the exam's range. */
function EvolutionTooltip({ active, payload }) {
  const point = active ? payload?.[0]?.payload : null;
  if (!point) return null;
  return (
    <Box sx={{ bgcolor: '#1A1C1E', color: '#FFFFFF', borderRadius: '8px', px: 1.25, py: 1, fontSize: 12, lineHeight: 1.5 }}>
      <Box sx={{ fontWeight: 500 }}>
        {point.label} · {formatDate(point.examDate)}
      </Box>
      <Box>
        {point.studentScore} pts · {meritLabel(point)}
      </Box>
      <Box sx={{ color: '#C5CCD8' }}>
        Máx. {point.examMax} · Mín. {point.examMin}
      </Box>
    </Box>
  );
}
