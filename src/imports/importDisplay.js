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

/** The review's filters: "Sin resolver", "Resueltas" and "Ignoradas". */
export const ROW_FILTERS = [
  { key: 'UNRESOLVED', label: 'Sin resolver', matches: (row) => row.status === 'UNRESOLVED' },
  { key: 'RESOLVED', label: 'Resueltas', matches: (row) => row.status !== 'UNRESOLVED' && row.status !== 'IGNORED' },
  { key: 'IGNORED', label: 'Ignoradas', matches: (row) => row.status === 'IGNORED' },
];
