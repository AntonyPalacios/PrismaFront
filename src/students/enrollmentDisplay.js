/** Activa / Retirada / Cerrada, as in the prototype's "Matrículas" table. */
export const ENROLLMENT_STATUS = {
  active: { label: 'Activa', bg: '#E8F5D6', fg: '#2F5A08' },
  withdrawn: { label: 'Retirada', bg: '#ECEFF3', fg: '#4A5160' },
  closed: { label: 'Cerrada', bg: '#ECEFF3', fg: '#4A5160' },
};

export function enrollmentStatus(enrollment) {
  if (!enrollment.active) return ENROLLMENT_STATUS.withdrawn;
  if (enrollment.stageStatus === 'CLOSED') return ENROLLMENT_STATUS.closed;
  return ENROLLMENT_STATUS.active;
}

/** Withdrawn enrollments and those of a closed cycle are history: read-only. */
export function isEnrollmentEditable(enrollment) {
  return enrollment.active && enrollment.cycleStatus !== 'CLOSED';
}

export function careerLabel(enrollment) {
  return enrollment.careerName ?? 'Sin definir';
}

export function tutorLabel(enrollment) {
  return enrollment.tutorName ?? 'Sin tutor';
}
