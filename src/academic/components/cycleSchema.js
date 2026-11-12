import { z } from 'zod';

// Same rules and messages as the backend (UpsertCycleRequest). Dates are the
// ISO text of <input type="date"> ("2026-03-01"), '' when empty; ISO dates
// compare correctly as plain text.
export const cycleSchema = z
  .object({
    name: z.string().trim().min(1, 'El ciclo necesita un nombre.').max(150, 'El nombre del ciclo es demasiado largo.'),
    startDate: z.string().min(1, 'Ingresa la fecha de inicio del ciclo.'),
    endDate: z.string(),
  })
  .refine((v) => !v.startDate || !v.endDate || v.endDate >= v.startDate, {
    path: ['endDate'],
    message: 'La fecha de fin no puede ser anterior a la fecha de inicio.',
  });

/** Form values → request body: the optional end date travels as null. */
export function toCycleBody(values) {
  return { name: values.name, startDate: values.startDate, endDate: values.endDate || null };
}
