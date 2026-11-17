import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Alert from '@mui/material/Alert';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { formatDate } from '../../academic/cycleDisplay';
import { errorDetail } from '../../app/api/errors';
import { useNotify } from '../../app/notifyContext';
import { useGetAreasQuery, useGetCoursesQuery } from '../../catalog/api/catalogApi';
import { useGetExamTypesQuery } from '../../catalog/api/examTypesApi';
import ResponsiveSheet from '../../layout/ResponsiveSheet';
import { useGetExamEnrollmentsQuery, useGetExamResultQuery, useSaveExamResultMutation } from '../api/examsApi';

const count = z.string().trim().regex(/^\d+$/, 'Entero de 0 a más');
const score = z
  .string()
  .trim()
  .regex(/^\d{1,4}([.,]\d{1,2})?$/, 'Número de 0 a más, hasta 2 decimales');

// what the backend checks too (REQ-EXAMS-04): every value typed, none negative; scores as the Excel brings them
const manualResultSchema = z.object({
  courses: z.array(z.object({ correct: count, wrong: count, blank: count })),
  areas: z.array(z.object({ score })),
  totalScore: score,
});

const toNumber = (text) => Number(String(text).trim().replace(',', '.'));
const numberProps = { size: 'small', inputMode: 'decimal', slotProps: { inputLabel: { shrink: true } } };

/**
 * "Resultado manual" (REQ-EXAMS-04) of one exam type that already has
 * results: pick a student enrolled in the stage (a tutor only sees their
 * own) and create or fix their result in the same form — correct, wrong and
 * blank per course of the type, each area's score and the total, all typed
 * as the academy's Excel brings them (nothing is calculated here). A
 * student without a result opens an empty form. Bottom sheet on mobile,
 * dialog on desktop.
 */
export default function ManualResultForm({ cycle, stage, mockExam, exam, onClose }) {
  const [enrollment, setEnrollment] = useState(null);
  const { data: enrollments = [], isLoading, error } = useGetExamEnrollmentsQuery(exam.id);

  return (
    <ResponsiveSheet onClose={onClose} maxWidth="md">
      <Box
        component="section"
        aria-label="Resultado manual"
        sx={{ display: 'flex', flexDirection: 'column', gap: 1.75, p: { xs: '12px 20px 24px', md: 3 }, overflowY: 'auto' }}
      >
        <Box>
          <Typography component="h2" sx={{ fontSize: 20, fontWeight: 500 }}>
            Resultado manual
          </Typography>
          <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
            {`${mockExam.name} · ${exam.examTypeName} · ${formatDate(mockExam.examDate)} · ${cycle.name} · ${stage.name}`}
          </Typography>
        </Box>

        {error && <Alert severity="error">{errorDetail(error)}</Alert>}
        <Autocomplete
          options={enrollments}
          loading={isLoading}
          value={enrollment}
          onChange={(_, chosen) => setEnrollment(chosen)}
          getOptionLabel={(option) => (option.dni ? `${option.fullName} · ${option.dni}` : option.fullName)}
          isOptionEqualToValue={(option, value) => option.enrollmentId === value.enrollmentId}
          noOptionsText="No hay alumnos matriculados que coincidan."
          renderOption={({ key, ...props }, option) => (
            <Box component="li" key={key} {...props} sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}>
              <span>{option.dni ? `${option.fullName} · ${option.dni}` : option.fullName}</span>
              <Typography component="span" sx={{ fontSize: 12, color: option.hasResult ? '#2F5A08' : 'text.secondary' }}>
                {option.hasResult ? 'Con resultado' : 'Sin resultado'}
              </Typography>
            </Box>
          )}
          renderInput={(params) => <TextField {...params} label="Alumno" placeholder="Busca por nombre o DNI" />}
        />

        {enrollment ? (
          <ResultEditor key={enrollment.enrollmentId} exam={exam} enrollment={enrollment} onClose={onClose} />
        ) : (
          <>
            <Typography sx={{ fontSize: 14, color: 'text.secondary' }}>
              Elige al alumno cuyo resultado vas a registrar o corregir.
            </Typography>
            <Button variant="outlined" onClick={onClose} sx={{ alignSelf: 'flex-end' }}>
              Cerrar
            </Button>
          </>
        )}
      </Box>
    </ResponsiveSheet>
  );
}

/** Loads the student's result (404 = none yet) and the exam type's courses, then shows the form. */
function ResultEditor({ exam, enrollment, onClose }) {
  const result = useGetExamResultQuery({ examId: exam.id, enrollmentId: enrollment.enrollmentId });
  const types = useGetExamTypesQuery();
  const courses = useGetCoursesQuery();
  const areas = useGetAreasQuery();
  const missing = result.error?.status === 404;
  const loading = result.isLoading || types.isLoading || courses.isLoading || areas.isLoading;

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress size={28} aria-label="Cargando resultado" />
      </Box>
    );
  }
  const loadError = (result.error && !missing && result.error) || types.error || courses.error || areas.error;
  if (loadError) return <Alert severity="error">{errorDetail(loadError)}</Alert>;

  const courseIds = types.data.find((type) => type.id === exam.examTypeId)?.courseIds ?? [];
  // catalog order: Lectura first, then Matemática's courses
  const examCourses = courses.data.filter((course) => courseIds.includes(course.id)).sort((a, b) => a.id - b.id);
  const examAreas = [...areas.data].sort((a, b) => a.id - b.id);
  return (
    <ResultFields
      exam={exam}
      enrollment={enrollment}
      result={missing ? null : result.data}
      courses={examCourses}
      areas={examAreas}
      onClose={onClose}
    />
  );
}

function ResultFields({ exam, enrollment, result, courses, areas, onClose }) {
  const notify = useNotify();
  const [serverError, setServerError] = useState(null);
  const [saveResult] = useSaveExamResultMutation();
  const defaultValues = useMemo(() => {
    const course = (id) => result?.courseResults.find((c) => c.courseId === id);
    const area = (id) => result?.areaScores.find((a) => a.areaId === id);
    const text = (value) => (value === undefined || value === null ? '' : String(value));
    return {
      courses: courses.map((c) => ({
        correct: text(course(c.id)?.correct),
        wrong: text(course(c.id)?.wrong),
        blank: text(course(c.id)?.blank),
      })),
      areas: areas.map((a) => ({ score: text(area(a.id)?.score) })),
      totalScore: text(result?.totalScore),
    };
  }, [result, courses, areas]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(manualResultSchema), defaultValues });

  const onSubmit = async (values) => {
    setServerError(null);
    try {
      await saveResult({
        examId: exam.id,
        enrollmentId: enrollment.enrollmentId,
        courseResults: courses.map((c, i) => ({
          courseId: c.id,
          correct: Number(values.courses[i].correct),
          wrong: Number(values.courses[i].wrong),
          blank: Number(values.courses[i].blank),
        })),
        areaScores: areas.map((a, i) => ({ areaId: a.id, score: toNumber(values.areas[i].score) })),
        totalScore: toNumber(values.totalScore),
      }).unwrap();
      notify('Resultado guardado.');
      onClose();
    } catch (error) {
      setServerError(errorDetail(error)); // the typed values stay
    }
  };

  return (
    <Box
      component="form"
      noValidate
      aria-label={`Resultado de ${enrollment.fullName}`}
      onSubmit={handleSubmit(onSubmit)}
      sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}
    >
      {result ? (
        <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
          {result.updatedByName
            ? `Última modificación: ${result.updatedByName}, ${formatDateTime(result.updatedAt)}`
            : `Última modificación: ${formatDateTime(result.updatedAt)}`}
          {result.attended ? '' : ' · No asistió'}
        </Typography>
      ) : (
        <Alert severity="info">Este alumno aún no tiene resultado en este examen: se creará al guardar.</Alert>
      )}

      <Typography component="h3" sx={{ fontSize: 14, fontWeight: 500 }}>
        Respuestas por curso
      </Typography>
      <Box component="ul" sx={{ listStyle: 'none', m: 0, p: 0, display: 'flex', flexDirection: 'column', gap: 1.25 }}>
        {courses.map((course, i) => (
          <Box
            component="li"
            key={course.id}
            aria-label={course.name}
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: 'repeat(3, minmax(0, 1fr))', sm: '1.4fr repeat(3, minmax(0, 1fr))' },
              alignItems: 'center',
              gap: 1,
            }}
          >
            <Typography sx={{ gridColumn: { xs: '1 / -1', sm: 'auto' }, fontSize: 14 }}>{course.name}</Typography>
            {[
              ['correct', 'Buenas'],
              ['wrong', 'Malas'],
              ['blank', 'En blanco'],
            ].map(([field, label]) => (
              <TextField
                key={field}
                label={label}
                {...numberProps}
                {...register(`courses.${i}.${field}`)}
                error={Boolean(errors.courses?.[i]?.[field])}
                helperText={errors.courses?.[i]?.[field]?.message}
                slotProps={{ ...numberProps.slotProps, htmlInput: { 'aria-label': `${label} de ${course.name}` } }}
              />
            ))}
          </Box>
        ))}
      </Box>

      <Typography component="h3" sx={{ fontSize: 14, fontWeight: 500, pt: 0.5 }}>
        Puntajes
      </Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, minmax(0, 1fr))' }, gap: 1 }}>
        {areas.map((area, i) => (
          <TextField
            key={area.id}
            label={`Puntaje de ${area.name}`}
            {...numberProps}
            {...register(`areas.${i}.score`)}
            error={Boolean(errors.areas?.[i]?.score)}
            helperText={errors.areas?.[i]?.score?.message}
          />
        ))}
        <TextField
          label="Puntaje total"
          {...numberProps}
          {...register('totalScore')}
          error={Boolean(errors.totalScore)}
          helperText={errors.totalScore?.message ?? 'Tal como viene en el Excel: el sistema no lo calcula.'}
        />
      </Box>

      {serverError && <Alert severity="error">{serverError}</Alert>}
      <Box sx={{ display: 'flex', gap: 1, pt: 0.5 }}>
        <Button variant="outlined" onClick={onClose} disabled={isSubmitting} sx={{ flex: 1, height: 48 }}>
          Cancelar
        </Button>
        <Button type="submit" variant="contained" color="secondary" disabled={isSubmitting} sx={{ flex: 1, height: 48 }}>
          Guardar
        </Button>
      </Box>
    </Box>
  );
}

function formatDateTime(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleString('es-PE', { dateStyle: 'medium', timeStyle: 'short' });
}
