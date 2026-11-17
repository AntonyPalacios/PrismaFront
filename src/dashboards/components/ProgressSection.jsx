import { useState } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
import { formatDate } from '../../academic/cycleDisplay';
import { errorDetail } from '../../app/api/errors';
import { colors } from '../../app/theme';
import { useGetScoreEvolutionQuery } from '../api/dashboardsApi';
import { examLabel } from '../examLabel';
import ChartCard from './ChartCard';
import MathRadar from './MathRadar';
import { AreaDistribution, CourseEffectiveness } from './EffectivenessCharts';

// the prototype's lines: the student solid, the exam's range dashed
const STUDENT = { key: 'studentScore', label: 'Alumno', color: colors.primary, width: 3 };
const MAX = { key: 'examMax', label: 'Máx. del examen', color: '#B55F00', width: 2, dash: '5 4' };
const MIN = { key: 'examMin', label: 'Mín. del examen', color: '#5A6170', width: 2, dash: '2 4' };
const AREA_LINES = [
  { color: colors.secondary, width: 3 },
  { color: '#3F7A0C', width: 2.5, dash: '6 3' },
];

/** "3° de 54": the student's position among everyone who sat the exam. */
const meritLabel = (point) => `${point.merit}° de ${point.meritOf}`;

/**
 * "Progreso" of a student (Claude Design: StudentChartsMobile,
 * REQ-DASHBOARDS-01 to 03): the total score exam after exam against the
 * highest and lowest of each exam, with the merit in the tooltip; apart,
 * the Lectura and Matemática scores; then the correct, wrong and blank
 * answers per course, and the correct and wrong ones per area and in total.
 * Only the active cycle unless "Incluir ciclos anteriores", which applies
 * to every chart but the Mathematics balance (REQ-DASHBOARDS-04), always a
 * picture of the latest exam of the active cycle. Each chart has a table for screen readers.
 */
export default function ProgressSection({ student }) {
  const [includeAllCycles, setIncludeAllCycles] = useState(false);
  const { currentData, isFetching, error } = useGetScoreEvolutionQuery({ studentId: student.id, includeAllCycles });
  const points = (currentData ?? []).map((point) => ({
    ...point,
    label: examLabel(point, includeAllCycles),
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
          <ChartCard
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
          </ChartCard>

          <ChartCard
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
          </ChartCard>

          <CourseEffectiveness studentId={student.id} includeAllCycles={includeAllCycles} />
          <AreaDistribution studentId={student.id} includeAllCycles={includeAllCycles} />
          <MathRadar studentId={student.id} />
        </>
      )}
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
