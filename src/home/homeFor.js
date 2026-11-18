/** Where each role lands after logging in: ADMIN or TUTOR wins over COORDINADOR. */
export function homeFor(roles = []) {
  if (roles.includes('ADMIN') || roles.includes('TUTOR')) return '/students';
  if (roles.includes('COORDINADOR')) return '/exams';
  return '/students';
}
