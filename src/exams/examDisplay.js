import { useGetMeQuery } from '../users/api/authApi';

/** ADMIN and COORDINADOR create, edit and delete exams; a TUTOR only reads them. */
export function useCanManageExams() {
  const { data: me } = useGetMeQuery();
  return Boolean(me?.roles?.some((role) => role === 'ADMIN' || role === 'COORDINADOR'));
}
