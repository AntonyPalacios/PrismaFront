import { z } from 'zod';

// Same rules and messages as the backend (UpsertExamTypeRequest), checked in
// the browser first so the user gets feedback without a round trip.
export const examTypeSchema = z.object({
  name: z.string().trim().min(1, 'El tipo de examen necesita un nombre.').max(50, 'El nombre es demasiado largo.'),
  courseIds: z.array(z.number()).min(1, 'Selecciona al menos un curso para este tipo de examen.'),
});
