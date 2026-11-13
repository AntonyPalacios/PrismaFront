import { useState } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ButtonBase from '@mui/material/ButtonBase';
import CircularProgress from '@mui/material/CircularProgress';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { errorDetail } from '../../app/api/errors';
import { colors } from '../../app/theme';
import { useGetEnrollmentsQuery } from '../api/enrollmentsApi';
import { careerLabel, enrollmentStatus, tutorLabel } from '../enrollmentDisplay';
import EnrollmentForm from './EnrollmentForm';

/**
 * "Matrículas" of a student's file (Claude Design: StudentDetailDesktop):
 * the history, newest stage first, as a table on desktop and cards on
 * mobile. A row opens the enrollment; "+ Nueva matrícula" only for an
 * active student. Only ADMIN and TUTOR get here (the parent decides).
 * Each row shows its current tutor ("Sin tutor" when none).
 */
export default function EnrollmentsSection({ student }) {
  const { data: enrollments = [], isLoading, error } = useGetEnrollmentsQuery(student.id);
  // null = closed, {} = creating, an enrollment = opening it
  const [open, setOpen] = useState(null);

  return (
    <Box
      component="section"
      aria-labelledby="student-enrollments-title"
      sx={{
        bgcolor: 'background.paper',
        border: 1,
        borderColor: 'divider',
        borderRadius: '16px',
        p: 2.5,
        display: 'flex',
        flexDirection: 'column',
        gap: 1.75,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5 }}>
        <Typography id="student-enrollments-title" component="h2" sx={{ fontSize: 16, fontWeight: 500 }}>
          Matrículas
        </Typography>
        {student.active && (
          <Button
            variant="outlined"
            onClick={() => setOpen({})}
            sx={{ height: 36, px: 1.75, borderRadius: '18px', borderColor: '#C5CCD8', color: colors.primary, fontSize: 13 }}
          >
            + Nueva matrícula
          </Button>
        )}
      </Box>

      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
          <CircularProgress size={24} aria-label="Cargando matrículas" />
        </Box>
      )}
      {!isLoading && error && <Alert severity="error">{errorDetail(error)}</Alert>}
      {!isLoading && !error && enrollments.length === 0 && (
        <Typography sx={{ fontSize: 14, color: 'text.secondary' }}>Este alumno aún no tiene matrículas.</Typography>
      )}

      {!isLoading && !error && enrollments.length > 0 && (
        <>
          {/* mobile */}
          <Box component="ul" sx={{ display: { xs: 'flex', md: 'none' }, listStyle: 'none', m: 0, p: 0, flexDirection: 'column', gap: 1 }}>
            {enrollments.map((enrollment) => (
              <Box component="li" key={enrollment.id}>
                <ButtonBase
                  onClick={() => setOpen(enrollment)}
                  aria-label={`Matrícula ${enrollment.cycleName} · ${enrollment.stageName}`}
                  sx={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    p: 1.5,
                    borderRadius: '12px',
                    bgcolor: '#F4F6FA',
                    textAlign: 'left',
                  }}
                >
                  <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography sx={{ fontSize: 14, fontWeight: 500 }}>
                      {enrollment.cycleName} · {enrollment.stageName}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                      <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
                        {careerLabel(enrollment)} · {tutorLabel(enrollment)}
                      </Typography>
                      <EnrollmentStatusChip enrollment={enrollment} />
                    </Box>
                  </Box>
                  <ChevronRightIcon aria-hidden="true" sx={{ fontSize: 20, color: '#8C96A8' }} />
                </ButtonBase>
              </Box>
            ))}
          </Box>

          {/* desktop */}
          <Box sx={{ display: { xs: 'none', md: 'block' }, overflowX: 'auto' }}>
            <Table size="small" aria-label="Matrículas">
              <TableHead>
                <TableRow>
                  <TableCell>Ciclo</TableCell>
                  <TableCell>Etapa</TableCell>
                  <TableCell>Carrera</TableCell>
                  <TableCell>Tutor</TableCell>
                  <TableCell>Estado</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {enrollments.map((enrollment) => (
                  <TableRow key={enrollment.id} hover onClick={() => setOpen(enrollment)} sx={{ cursor: 'pointer' }}>
                    <TableCell>{enrollment.cycleName}</TableCell>
                    <TableCell>
                      <ButtonBase
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpen(enrollment);
                        }}
                        sx={{ fontSize: 13, fontWeight: 500 }}
                      >
                        {enrollment.stageName}
                      </ButtonBase>
                    </TableCell>
                    <TableCell sx={{ color: enrollment.careerName ? 'inherit' : 'text.secondary' }}>{careerLabel(enrollment)}</TableCell>
                    <TableCell sx={{ color: enrollment.tutorName ? 'inherit' : 'text.secondary' }}>{tutorLabel(enrollment)}</TableCell>
                    <TableCell>
                      <EnrollmentStatusChip enrollment={enrollment} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        </>
      )}

      {open && (
        <EnrollmentForm
          student={student}
          enrollment={open.id ? open : null}
          enrollments={enrollments}
          onClose={() => setOpen(null)}
        />
      )}
    </Box>
  );
}

function EnrollmentStatusChip({ enrollment }) {
  const status = enrollmentStatus(enrollment);
  return (
    <Box
      component="span"
      sx={{ fontSize: 12, fontWeight: 500, px: 1.25, py: 0.375, borderRadius: '12px', bgcolor: status.bg, color: status.fg }}
    >
      {status.label}
    </Box>
  );
}
