// Status chips: "Activo" uses the prototype's green (CycleDetailMobile).
export const CYCLE_STATUS = {
  PLANNED: { label: 'Planificado', bg: '#E1EBF7', fg: '#002F6C' },
  ACTIVE: { label: 'Activo', bg: '#E8F5D6', fg: '#2F5A08' },
  CLOSED: { label: 'Cerrado', bg: '#ECEFF3', fg: '#4A5160' },
};

const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

/**
 * "2026-08-04" → "04 ago 2026", as in the prototype. Built from the text
 * itself (never through Date) so the day can't shift with the time zone.
 */
export function formatDate(isoDate) {
  if (!isoDate) return null;
  const [year, month, day] = isoDate.split('-');
  return `${day} ${MONTHS[Number(month) - 1]} ${year}`;
}

/** "04 ago 2026 – 19 dic 2026", or "04 ago 2026 – sin fecha de fin". */
export function cycleDates(cycle) {
  return `${formatDate(cycle.startDate)} – ${formatDate(cycle.endDate) ?? 'sin fecha de fin'}`;
}
