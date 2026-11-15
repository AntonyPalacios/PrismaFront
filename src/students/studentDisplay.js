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

/**
 * ADMIN and TUTOR register students and work with their enrollments; a
 * COORDINADOR only reads them. Editing a student's data is narrower: see
 * useCanEditStudent.
 */
export function useCanManageStudents() {
  const { data: me } = useGetMeQuery();
  return Boolean(me?.roles?.some((role) => role === 'ADMIN' || role === 'TUTOR'));
}

/** Only ADMIN or the student's current tutor edit their data (no exception for whoever registered them). */
export function useCanEditStudent(student) {
  const { data: me } = useGetMeQuery();
  if (!me || !student) return false;
  const roles = me.roles ?? [];
  return roles.includes('ADMIN') || (roles.includes('TUTOR') && student.tutorId != null && student.tutorId === me.id);
}
