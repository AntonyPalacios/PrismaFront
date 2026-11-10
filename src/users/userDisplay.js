export const ALL_ROLES = ['ADMIN', 'TUTOR', 'COORDINADOR'];

/** "Apellidos, Nombres" for a managed user (lastNamePat + lastNameMat). */
export function userFullName(user) {
  const lastNames = [user.lastNamePat, user.lastNameMat].filter(Boolean).join(' ');
  return `${lastNames}, ${user.firstName}`;
}

export function userInitials(user) {
  return `${user.lastNamePat?.[0] ?? ''}${user.firstName?.[0] ?? ''}`.toUpperCase();
}

export const STATUS = {
  active: { label: 'Activo', bg: '#E8F5D6', fg: '#2F5A08' },
  inactive: { label: 'Inactivo', bg: '#ECEFF3', fg: '#4A5160' },
};
