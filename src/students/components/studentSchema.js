import { z } from 'zod';
import { todayIso } from '../../academic/cycleDisplay';

// Same rules and messages as the backend (UpsertStudentRequest). Optional
// fields are '' when empty; the birth date is the ISO text of <input type="date">.
export const studentSchema = z.object({
  firstName: z.string().trim().min(1, 'Ingresa los nombres del alumno.').max(150, 'Los nombres son demasiado largos.'),
  lastNamePat: z
    .string()
    .trim()
    .min(1, 'Ingresa el apellido paterno del alumno.')
    .max(100, 'El apellido paterno es demasiado largo.'),
  lastNameMat: z.string().trim().max(100, 'El apellido materno es demasiado largo.'),
  // Peruvian DNI (8 digits) or a foreigner's card
  dni: z
    .string()
    .trim()
    .refine((v) => v === '' || /^[A-Za-z0-9]{8,12}$/.test(v), 'El DNI debe tener entre 8 y 12 letras o números.'),
  email: z
    .string()
    .trim()
    .max(255, 'El correo es demasiado largo.')
    .refine((v) => v === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), 'El correo no tiene un formato válido.'),
  phone: z.string().trim().max(30, 'El teléfono es demasiado largo.'),
  birthDate: z.string().refine((v) => v === '' || v <= todayIso(), 'La fecha de nacimiento no puede ser futura.'),
});

export const EMPTY_STUDENT = { firstName: '', lastNamePat: '', lastNameMat: '', dni: '', email: '', phone: '', birthDate: '' };

/** A student from the backend → form values (null becomes ''). */
export function toStudentForm(student) {
  return Object.fromEntries(Object.keys(EMPTY_STUDENT).map((key) => [key, student?.[key] ?? '']));
}

/** Form values → request body: empty optional fields travel as null. */
export function toStudentBody(values) {
  return {
    firstName: values.firstName,
    lastNamePat: values.lastNamePat,
    lastNameMat: values.lastNameMat || null,
    dni: values.dni ? values.dni.toUpperCase() : null,
    email: values.email || null,
    phone: values.phone || null,
    birthDate: values.birthDate || null,
  };
}
