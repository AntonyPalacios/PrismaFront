import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const visuallyHidden = { position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)', whiteSpace: 'nowrap' };

/**
 * A line chart with its title and legend. `lines` are { key, label, color,
 * width, dash? } over `points` (each with a `label` for the X axis);
 * `toolbar` goes under the title (e.g. the course buttons); `children` is
 * the same data as table rows, for screen readers.
 */
export default function ChartCard({ id, title, aside, asideColor, toolbar, points, lines, tooltip, children }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 1 }}>
        <Typography id={`${id}-title`} component="h3" sx={{ fontSize: 16, fontWeight: 500 }}>
          {title}
        </Typography>
        {aside && <Typography sx={{ fontSize: 13, fontWeight: 500, color: asideColor }}>{aside}</Typography>}
      </Box>
      {toolbar}
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
                // dots on every line: with a single exam there is no segment to draw
                dot={{ r: line.dash ? 3 : 4, fill: line.color }}
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
      {/* hidden on a div: a table ignores the 1px width and would widen the page */}
      <Box sx={visuallyHidden}>
        <table aria-labelledby={`${id}-title`}>{children}</table>
      </Box>
    </Box>
  );
}
