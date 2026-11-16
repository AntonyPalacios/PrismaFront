import { useGetMeQuery } from '../users/api/authApi';

/** ADMIN and TUTOR import students (they are the ones who register them). */
export function useCanImport() {
  const { data: me } = useGetMeQuery();
  return Boolean(me?.roles?.some((role) => role === 'ADMIN' || role === 'TUTOR'));
}

export const BATCH_STATUS = {
  PENDING_REVIEW: { label: 'Pendiente', bg: '#FFF0DD', fg: '#7A4100' },
  CONFIRMED: { label: 'Confirmada', bg: '#E8F5D6', fg: '#2F5A08' },
  DISCARDED: { label: 'Descartada', bg: '#ECEFF3', fg: '#4A5160' },
  SUPERSEDED: { label: 'Reemplazada', bg: '#ECEFF3', fg: '#4A5160' },
};

/** What a row will become when the batch is confirmed. */
export const ROW_STATUS = {
  NEW_STUDENT: { label: 'Alumno nuevo', bg: '#E1EBF7', fg: '#002F6C' },
  AUTO_MATCHED: { label: 'Ya registrado', bg: '#E8F5D6', fg: '#2F5A08' },
  MANUAL_MATCHED: { label: 'Emparejado', bg: '#E8F5D6', fg: '#2F5A08' },
  UNRESOLVED: { label: 'Sin resolver', bg: '#FFF0DD', fg: '#7A4100' },
  IGNORED: { label: 'Ignorada', bg: '#ECEFF3', fg: '#4A5160' },
};

/** Extra marks of a row that will be enrolled without a career or a tutor (assigned by hand later). */
export const NO_CAREER = { label: 'Sin carrera', bg: '#F1E7FB', fg: '#5B2A86' };
export const NO_TUTOR = { label: 'Sin tutor', bg: '#DDF3F1', fg: '#0B5A54' };

const counts = (row) => row.status !== 'IGNORED';

/**
 * The review's filters. By progress: "Sin resolver", "Resueltas" and
 * "Ignoradas". By what the row is: new or already registered. And, only
 * when the batch enrolls (`needsStage`), the rows left without career or tutor.
 */
export const ROW_FILTERS = [
  { key: 'UNRESOLVED', label: 'Sin resolver', matches: (row) => row.status === 'UNRESOLVED' },
  { key: 'RESOLVED', label: 'Resueltas', matches: (row) => row.status !== 'UNRESOLVED' && row.status !== 'IGNORED' },
  { key: 'IGNORED', label: 'Ignoradas', matches: (row) => row.status === 'IGNORED' },
  { key: 'NEW', label: 'Alumnos nuevos', matches: (row) => row.status === 'NEW_STUDENT' },
  { key: 'REGISTERED', label: 'Ya registrados', matches: (row) => row.status === 'AUTO_MATCHED' || row.status === 'MANUAL_MATCHED' },
  { key: 'NO_CAREER', label: 'Sin carrera', needsStage: true, matches: (row) => counts(row) && !row.careerName },
  { key: 'NO_TUTOR', label: 'Sin tutor', needsStage: true, matches: (row) => counts(row) && !row.tutorName },
];
