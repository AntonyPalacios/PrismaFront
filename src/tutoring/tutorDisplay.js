import { formatShortDate } from '../academic/cycleDisplay';

const ACADEMY_ZONE = 'America/Lima';

/** The academy-day ("2026-09-28") of an ISO date-time such as "2026-09-28T15:20:00-05:00". */
export function academyDay(isoDateTime) {
  if (!isoDateTime) return null;
  // en-CA formats as YYYY-MM-DD
  return new Intl.DateTimeFormat('en-CA', { timeZone: ACADEMY_ZONE }).format(new Date(isoDateTime));
}

/** "28 sep 2026", as in the prototype's "Vigente desde 28 sep 2026". */
export function formatLongDay(isoDateTime) {
  const day = academyDay(isoDateTime);
  return day ? `${formatShortDate(day)} ${day.slice(0, 4)}` : null;
}

/** "28 sep – vigente" or "04 ago – 27 sep", as in the prototype's "Historial de tutores". */
export function assignmentRange(assignment) {
  const from = formatShortDate(academyDay(assignment.validFrom));
  return assignment.validTo ? `${from} – ${formatShortDate(academyDay(assignment.validTo))}` : `${from} – vigente`;
}
