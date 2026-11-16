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
  AUTO_MATCHED: { label: 'Actualiza datos', bg: '#E8F5D6', fg: '#2F5A08' },
  MANUAL_MATCHED: { label: 'Actualiza datos', bg: '#E8F5D6', fg: '#2F5A08' },
  UNRESOLVED: { label: 'Sin resolver', bg: '#FFF0DD', fg: '#7A4100' },
  IGNORED: { label: 'Ignorada', bg: '#ECEFF3', fg: '#4A5160' },
};

/** What a row of an exam results batch will become. */
export const RESULT_ROW_STATUS = {
  NEW_STUDENT: { label: 'Alumno nuevo', bg: '#E1EBF7', fg: '#002F6C' },
  AUTO_MATCHED: { label: 'Alumno encontrado', bg: '#E8F5D6', fg: '#2F5A08' },
  MANUAL_MATCHED: { label: 'Alumno encontrado', bg: '#E8F5D6', fg: '#2F5A08' },
  UNRESOLVED: { label: 'Sin resolver', bg: '#FFF0DD', fg: '#7A4100' },
  IGNORED: { label: 'Ignorada', bg: '#ECEFF3', fg: '#4A5160' },
};

/** Extra marks of a results row: confirming enrolls the student, or they did not sit the exam. */
export const ENROLLS = { label: 'Se matriculará', bg: '#F1E7FB', fg: '#5B2A86' };
export const ABSENT = { label: 'No asistió', bg: '#ECEFF3', fg: '#4A5160' };

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
  { key: 'REGISTERED', label: 'Actualiza datos', matches: (row) => row.status === 'AUTO_MATCHED' || row.status === 'MANUAL_MATCHED' },
  { key: 'NO_CAREER', label: 'Sin carrera', needsStage: true, matches: (row) => counts(row) && !row.careerName },
  { key: 'NO_TUTOR', label: 'Sin tutor', needsStage: true, matches: (row) => counts(row) && !row.tutorName },
];

/** The review's filters of an exam results batch. */
export const RESULT_ROW_FILTERS = [
  ROW_FILTERS[0],
  ROW_FILTERS[1],
  ROW_FILTERS[2],
  { key: 'NEW', label: 'Alumnos nuevos', matches: (row) => row.status === 'NEW_STUDENT' },
  { key: 'ENROLLS', label: 'Se matricularán', matches: (row) => row.enrolls },
  { key: 'ABSENT', label: 'No asistieron', matches: (row) => counts(row) && row.result && !row.result.attended },
];

/** Exam results batches are for every role; students batches only for ADMIN and TUTOR. */
export const isResults = (batch) => batch.type === 'EXAM_RESULTS';

/** "Rojas Mamani Ana Sofía" → the usual split of a Peruvian name: two last names, then the first names. */
export function splitName(fullName) {
  const words = (fullName ?? '').trim().split(/\s+/).filter(Boolean);
  if (words.length <= 2) return { lastNamePat: words[0] ?? '', lastNameMat: '', firstName: words[1] ?? '' };
  return { lastNamePat: words[0], lastNameMat: words[1], firstName: words.slice(2).join(' ') };
}

/** "QUISPE" → "Quispe": the file's names come in capitals. */
export function titleCase(text) {
  return (text ?? '').toLocaleLowerCase('es-PE').replace(/(^|[\s'-])(\p{L})/gu, (m, sep, letter) => sep + letter.toLocaleUpperCase('es-PE'));
}

/** "Total 722.76", "Lectura 787.5"…: what the file says, as it says it. */
export function scores(result) {
  return [`Total ${result.totalScore ?? '—'}`, ...result.areas.map((area) => `${area.areaName} ${area.score}`)];
}

/** "Apellidos, Nombres" of a student registered from a row. */
export function newStudentName(student) {
  return `${[student.lastNamePat, student.lastNameMat].filter(Boolean).join(' ')}, ${student.firstName}`;
}
