// Status chips: "Activo" uses the prototype's green (CycleDetailMobile).
export const CYCLE_STATUS = {
  PLANNED: { label: 'Planificado', bg: '#E1EBF7', fg: '#002F6C' },
  ACTIVE: { label: 'Activo', bg: '#E8F5D6', fg: '#2F5A08' },
  CLOSED: { label: 'Cerrado', bg: '#ECEFF3', fg: '#4A5160' },
};

// same colors, feminine labels ("la etapa")
export const STAGE_STATUS = {
  PLANNED: { ...CYCLE_STATUS.PLANNED, label: 'Planificada' },
  ACTIVE: { ...CYCLE_STATUS.ACTIVE, label: 'Activa' },
  CLOSED: { ...CYCLE_STATUS.CLOSED, label: 'Cerrada' },
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

/** "2026-08-04" → "04 ago": stages live inside one cycle, so the prototype drops the year. */
export function formatShortDate(isoDate) {
  if (!isoDate) return null;
  const [, month, day] = isoDate.split('-');
  return `${day} ${MONTHS[Number(month) - 1]}`;
}

/** "04 ago – 27 sep", or "16 nov – sin fin", as in the prototype's stage cards. */
export function stageDates(stage) {
  return `${formatShortDate(stage.startDate)} – ${formatShortDate(stage.endDate) ?? 'sin fin'}`;
}

/**
 * Today as "2026-11-11" in the academy's time zone, the same "today" the
 * backend uses for its rules (en-CA formats dates as ISO).
 */
export function todayIso() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Lima' }).format(new Date());
}

/** "04 ago 2026 – 19 dic 2026", or "04 ago 2026 – sin fecha de fin". */
export function cycleDates(cycle) {
  return `${formatDate(cycle.startDate)} – ${formatDate(cycle.endDate) ?? 'sin fecha de fin'}`;
}
