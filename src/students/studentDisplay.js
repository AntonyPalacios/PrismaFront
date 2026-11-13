import { useGetMeQuery } from '../users/api/authApi';

/** "Apellidos, Nombres": the display order agreed for every person in the app. */
export function studentFullName(student) {
  const lastNames = [student.lastNamePat, student.lastNameMat].filter(Boolean).join(' ');
  return `${lastNames}, ${student.firstName}`;
}

/** Paternal surname + first name, as in the prototype's avatars ("Campos Herrera, Lucía" → "CL"). */
export function studentInitials(student) {
  return `${student.lastNamePat?.[0] ?? ''}${student.firstName?.[0] ?? ''}`.toUpperCase();
}

/** ADMIN and TUTOR register and edit students; a COORDINADOR only reads them. */
export function useCanManageStudents() {
  const { data: me } = useGetMeQuery();
  return Boolean(me?.roles?.some((role) => role === 'ADMIN' || role === 'TUTOR'));
}
