import { z } from 'zod';

// Same rules and messages as the backend (UpsertCareerRequest).
export const careerSchema = z.object({
  name: z.string().trim().min(1, 'La carrera necesita un nombre.').max(100, 'El nombre de la carrera es demasiado largo.'),
  abbreviation: z.string().trim().max(20, 'La abreviatura es demasiado larga.'),
  // the select starts empty ('') and holds the exam type id once chosen
  examTypeId: z.union([z.number(), z.literal('')]).refine((v) => v !== '', 'Selecciona el tipo de examen de la carrera.'),
});
