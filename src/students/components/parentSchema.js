import { z } from 'zod';

/** Relationship of a guardian to one student: the backend's values and how they read. */
export const RELATIONSHIPS = [
  { value: 'MADRE', label: 'Mamá' },
  { value: 'PADRE', label: 'Papá' },
  { value: 'HERMANO', label: 'Hermano/a' },
  { value: 'OTRO', label: 'Otro' },
];

export const relationshipLabel = (value) => RELATIONSHIPS.find((r) => r.value === value)?.label ?? value;

// what the backend checks too (REQ-STUDENTS-03): name and phone required, the phone
// 7 to 15 digits (a leading "+" and spaces allowed), the email optional
export const contactSchema = z.object({
  fullName: z.string().trim().min(1, 'Ingresa el nombre completo').max(200, 'Es demasiado largo'),
  phone: z
    .string()
    .trim()
    .min(1, 'Ingresa el celular')
    .regex(/^\+?[0-9]( *[0-9]){6,14}$/, 'Debe tener entre 7 y 15 dígitos'),
  email: z.union([z.literal(''), z.string().trim().email('Correo no válido').max(255, 'Es demasiado largo')]),
});

/** As the backend wants it: spaces collapsed, no email = null. */
export function toContact(values) {
  return {
    fullName: values.fullName.trim().replace(/\s+/g, ' '),
    phone: values.phone.trim().replace(/\s+/g, ' '),
    email: values.email.trim() === '' ? null : values.email.trim(),
  };
}
