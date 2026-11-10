import { z } from 'zod';

// Same rules and messages as the backend (CreateUserRequest / UpdateUserRequest).
const personFields = {
  firstName: z.string().trim().min(1, 'Ingresa los nombres del usuario.').max(150, 'Los nombres son demasiado largos.'),
  lastNamePat: z
    .string()
    .trim()
    .min(1, 'Ingresa el apellido paterno del usuario.')
    .max(100, 'El apellido paterno es demasiado largo.'),
  lastNameMat: z.string().trim().max(100, 'El apellido materno es demasiado largo.'),
  roles: z.array(z.enum(['ADMIN', 'TUTOR', 'COORDINADOR'])).min(1, 'Selecciona al menos un rol.'),
};

export const updateUserSchema = z.object(personFields);

export const createUserSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Ingresa el correo del usuario.')
    .max(255, 'El correo es demasiado largo.')
    .pipe(z.email('El correo no tiene un formato válido.')),
  ...personFields,
});

/** Request body from form values: empty maternal surname travels as null. */
export function toUserBody(values) {
  return { ...values, lastNameMat: values.lastNameMat || null };
}
