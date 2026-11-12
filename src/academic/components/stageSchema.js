import { z } from 'zod';

// Same rules and messages as the backend (UpsertStageRequest). Dates are the
// ISO text of <input type="date">, '' when empty; ISO dates compare as text.
// The rules that need the cycle or its other stages (dates inside the cycle,
// no overlap, unique name) are checked by the backend.
export const stageSchema = z
  .object({
    name: z.string().trim().min(1, 'La etapa necesita un nombre.').max(150, 'El nombre de la etapa es demasiado largo.'),
    startDate: z.string().min(1, 'Ingresa la fecha de inicio de la etapa.'),
    endDate: z.string(),
  })
  .refine((v) => !v.startDate || !v.endDate || v.endDate >= v.startDate, {
    path: ['endDate'],
    message: 'La fecha de fin no puede ser anterior a la fecha de inicio.',
  });

/** Form values → request body: the optional end date travels as null. */
export function toStageBody(values) {
  return { name: values.name, startDate: values.startDate, endDate: values.endDate || null };
}
