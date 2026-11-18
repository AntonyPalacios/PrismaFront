import { useMemo, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router';
import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ButtonBase from '@mui/material/ButtonBase';
import CircularProgress from '@mui/material/CircularProgress';
import Fab from '@mui/material/Fab';
import FormControlLabel from '@mui/material/FormControlLabel';
import InputBase from '@mui/material/InputBase';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Table from '@mui/material/Table';
import TablePagination from '@mui/material/TablePagination';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import SearchIcon from '@mui/icons-material/Search';
import { errorDetail } from '../../app/api/errors';
import { colors } from '../../app/theme';
import { useGetCareersQuery } from '../../catalog/api/careersApi';
import { useGetStudentsQuery } from '../api/studentsApi';
import ImportStudentsForm from '../../imports/components/ImportStudentsForm';
import CreateStudentForm from '../components/CreateStudentForm';
import { useIsAdmin, useIsOnlyTutor } from '../../users/api/authApi';
import { useGetUsersQuery } from '../../users/api/usersApi';
import { careerGroups } from '../careerGroups';
import { studentFullName, studentInitials, useCanManageStudents } from '../studentDisplay';

const PAGE_SIZES = [25, 50, 100];
const NO_CAREER = 'none';

/** Lower case, no accents, single spaces: "  Álvarez   PÉREZ " → "alvarez perez" (as the backend did). */
function normalize(text) {
  return (text ?? '')
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ');
}

/** Every typed word must appear in the surnames, names or DNI. */
function matches(student, wanted) {
  if (!wanted) return true;
  const haystack = normalize([student.lastNamePat, student.lastNameMat, student.firstName, student.dni].filter(Boolean).join(' '));
  return wanted.split(' ').every((word) => haystack.includes(word));
}

/** The career groups of the list, from the catalog (see careerGroups). */
function useCareerGroups() {
  const { data: careers = [] } = useGetCareersQuery();
  return useMemo(() => careerGroups(careers), [careers]);
}

/**
 * "Alumnos" (Claude Design: StudentsMobile / StudentsDesktop). The list
 * is loaded once and searched (name or DNI, ignoring case and accents),
 * filtered by career group and paged (25, 50 or 100) right here, with no
 * request per keystroke (agreements of 2026-11-17). Cards on mobile and a
 * table on desktop, always in the backend's A–Z order by surnames. A row opens the
 * student's file. Inactive (retired) students only appear with "Mostrar
 * inactivos", for every role.
 * Each student shows the stage and tutor of their current enrollment. An
 * ADMIN filters by tutor or "Sin tutor asignado"; a TUTOR (not admin) gets
 * "Mis alumnos": only their current students, without tutor column or filter
 * (the backend already narrows the list). A COORDINADOR sees the tutor but
 * does not filter. Registering a student opens their file.
 */
export default function StudentsPage() {
  const navigate = useNavigate();
  const canManage = useCanManageStudents();
  const location = useLocation();
  const [creating, setCreating] = useState(false);
  const [importing, setImporting] = useState(false);
  // the filters live in the URL (?q=&tutor=&career=&inactive=1&page=&size=): coming
  // back from a student's file, reloading or sharing the link keeps them
  const [params, setParams] = useSearchParams();
  const typed = params.get('q') ?? '';
  const includeInactive = params.get('inactive') === '1';
  // '' = every tutor, 'none' = without tutor, otherwise a tutor's id (ADMIN only)
  const tutorFilter = params.get('tutor') ?? '';
  // '' = every career, 'none' = without one, otherwise an exam type's id (its careers)
  const careerFilter = params.get('career') ?? '';
  const page = Math.max(0, (Number(params.get('page')) || 1) - 1);
  const pageSize = PAGE_SIZES.includes(Number(params.get('size'))) ? Number(params.get('size')) : PAGE_SIZES[0];
  // replace, not push: "back" leaves the list instead of undoing every keystroke
  const setParam = (key, value, { keepPage = false } = {}) =>
    setParams(
      (current) => {
        const next = new URLSearchParams(current);
        if (value === '' || value == null || value === false) next.delete(key);
        else next.set(key, value === true ? '1' : String(value));
        if (!keepPage) next.delete('page');
        return next;
      },
      { replace: true },
    );
  const isAdmin = useIsAdmin();
  const onlyTutor = useIsOnlyTutor();
  const showTutor = !onlyTutor;
  const search = typed.trim();
  const { data: loaded = [], isLoading, isFetching, error } = useGetStudentsQuery({
    includeInactive,
    tutorId: tutorFilter && tutorFilter !== 'none' ? Number(tutorFilter) : null,
    withoutTutor: tutorFilter === 'none',
  });
  // the file's "‹ Alumnos" comes back to this same list
  const open = (student) => navigate(`/students/${student.id}`, { state: { listSearch: location.search } });
  const careerGroups = useCareerGroups();
  const students = useMemo(() => {
    const wanted = normalize(search);
    return loaded.filter(
      (student) =>
        matches(student, wanted) &&
        (careerFilter === '' ||
          (careerFilter === NO_CAREER ? student.examTypeId == null : String(student.examTypeId) === careerFilter)),
    );
  }, [loaded, search, careerFilter]);
  // a filter that shrinks the list never leaves you on an empty page
  const lastPage = Math.max(0, Math.ceil(students.length / pageSize) - 1);
  const shownPage = Math.min(page, lastPage);
  const pageOfStudents = students.slice(shownPage * pageSize, (shownPage + 1) * pageSize);
  // every filter starts over on the first page
  const filtering = (key) => (value) => setParam(key, value);

  const inactiveCount = students.filter((student) => !student.active).length;
  const count = `${students.length} ${students.length === 1 ? 'alumno' : 'alumnos'}`;
  let countLabel = search ? `${count} para "${search}"` : count;
  if (onlyTutor && !search) {
    countLabel = `${count} ${students.length === 1 ? 'asignado' : 'asignados'} a ti`;
    if (includeInactive) countLabel += ` · ${inactiveCount} ${inactiveCount === 1 ? 'inactivo' : 'inactivos'}`;
  } else if (includeInactive) {
    countLabel += ` · ${inactiveCount} ${inactiveCount === 1 ? 'inactivo' : 'inactivos'}`;
  } else if (!search) {
    countLabel += ` ${students.length === 1 ? 'activo' : 'activos'}`;
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 1080, pb: { xs: 10, md: 0 } }}>
      <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'flex-end', justifyContent: 'space-between', gap: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <Typography component="h1" sx={{ fontSize: 28, fontWeight: 500 }}>
            {onlyTutor ? 'Mis alumnos' : 'Alumnos'}
          </Typography>
          <Typography sx={{ fontSize: 14, color: 'text.secondary' }}>
            {onlyTutor ? 'Los alumnos que tienes asignados en la etapa vigente.' : 'La ficha de cada alumno de la academia.'}
          </Typography>
        </Box>
        {canManage && (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant="outlined" onClick={() => setImporting(true)} sx={{ borderRadius: '22px' }}>
              Importar alumnos
            </Button>
            <Button variant="contained" color="secondary" startIcon={<AddIcon />} onClick={() => setCreating(true)}>
              Nuevo alumno
            </Button>
          </Box>
        )}
      </Box>

      <Box
        sx={{
          // mobile: full-bleed white strip under the app bar, as in the prototype
          mx: { xs: -2, md: 0 },
          mt: { xs: -2, md: 0 },
          px: 2,
          pt: 1.5,
          pb: 1.25,
          display: 'flex',
          flexDirection: 'column',
          gap: 1.25,
          bgcolor: 'background.paper',
          borderBottom: 1,
          borderColor: 'divider',
          borderRadius: { md: '12px' },
          border: { md: 1 },
        }}
      >
        <Box
          component="label"
          sx={{ display: 'flex', alignItems: 'center', gap: 1.25, height: 48, px: 1.75, borderRadius: '24px', bgcolor: '#EEF1F6' }}
        >
          <SearchIcon aria-hidden="true" sx={{ fontSize: 20, color: 'text.secondary' }} />
          <InputBase
            type="search"
            value={typed}
            onChange={(e) => filtering('q')(e.target.value)}
            placeholder="Buscar por apellido, nombre o DNI"
            inputProps={{ 'aria-label': 'Buscar alumno' }}
            sx={{ flex: 1, minWidth: 0, fontSize: 15 }}
          />
        </Box>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.25 }}>
          {isAdmin && <TutorFilter value={tutorFilter} onChange={filtering('tutor')} />}
          <CareerFilter value={careerFilter} groups={careerGroups} onChange={filtering('career')} />
        </Box>
        {canManage && (
          <Button variant="outlined" size="small" onClick={() => setImporting(true)} sx={{ display: { md: 'none' }, alignSelf: 'flex-start' }}>
            Importar alumnos
          </Button>
        )}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
          <Typography role="status" sx={{ fontSize: 12, color: 'text.secondary' }}>
            {isLoading || isFetching ? 'Cargando…' : `${countLabel} · orden A–Z por apellido`}
          </Typography>
          <FormControlLabel
            labelPlacement="start"
            control={<Switch size="small" checked={includeInactive} onChange={(e) => filtering('inactive')(e.target.checked)} />}
            label="Mostrar inactivos"
            slotProps={{ typography: { sx: { fontSize: 13 } } }}
            sx={{ mr: 0 }}
          />
        </Box>
      </Box>

      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress size={32} aria-label="Cargando alumnos" />
        </Box>
      )}

      {!isLoading && error && <Alert severity="error">{errorDetail(error)}</Alert>}

      {!isLoading && !error && students.length === 0 && (
        <Typography sx={{ py: 4, textAlign: 'center', color: 'text.secondary' }}>
          {emptyMessage({ search, tutorFilter, careerFilter, onlyTutor })}
        </Typography>
      )}

      {!isLoading && !error && students.length > 0 && (
        <>
          {/* mobile */}
          <Box
            component="ul"
            sx={{ display: { xs: 'flex', md: 'none' }, listStyle: 'none', m: 0, p: 0, flexDirection: 'column', gap: 1.25 }}
          >
            {pageOfStudents.map((student) => (
              <Box component="li" key={student.id}>
                <StudentCard student={student} showTutor={showTutor} onOpen={() => open(student)} />
              </Box>
            ))}
          </Box>

          {/* desktop */}
          <Box
            sx={{
              display: { xs: 'none', md: 'block' },
              bgcolor: 'background.paper',
              border: 1,
              borderColor: 'divider',
              borderRadius: '16px',
              overflowX: 'auto',
            }}
          >
            <Table aria-label="Alumnos">
              <TableHead>
                <TableRow>
                  <TableCell>Nombre</TableCell>
                  <TableCell>DNI</TableCell>
                  {showTutor && <TableCell>Tutor actual</TableCell>}
                  <TableCell>Etapa vigente</TableCell>
                  <TableCell>Carrera</TableCell>
                  <TableCell>Teléfono</TableCell>
                  <TableCell>Estado</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pageOfStudents.map((student) => (
                  <TableRow key={student.id} hover onClick={() => open(student)} sx={{ cursor: 'pointer' }}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <StudentAvatar student={student} size={32} />
                        <ButtonBase
                          onClick={(e) => {
                            e.stopPropagation();
                            open(student);
                          }}
                          sx={{ fontSize: 14, fontWeight: 500 }}
                        >
                          {studentFullName(student)}
                        </ButtonBase>
                      </Box>
                    </TableCell>
                    <TableCell>{student.dni ?? <Muted>Sin DNI</Muted>}</TableCell>
                    {showTutor && (
                      <TableCell>
                        <TutorLabel student={student} />
                      </TableCell>
                    )}
                    <TableCell>{student.currentStageName ?? <Muted>—</Muted>}</TableCell>
                    <TableCell>{student.careerName ?? <Muted>—</Muted>}</TableCell>
                    <TableCell>{student.phone ?? <Muted>—</Muted>}</TableCell>
                    <TableCell>
                      <StudentStatusChip active={student.active} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>

          {students.length > PAGE_SIZES[0] && (
            <TablePagination
              component="div"
              count={students.length}
              page={shownPage}
              onPageChange={(_, next) => setParam('page', next + 1, { keepPage: true })}
              rowsPerPage={pageSize}
              rowsPerPageOptions={PAGE_SIZES}
              onRowsPerPageChange={(e) => {
                setParam('size', Number(e.target.value) === PAGE_SIZES[0] ? '' : e.target.value);
              }}
              labelRowsPerPage="Por página"
              labelDisplayedRows={({ from, to, count: total }) => `${from}–${to} de ${total}`}
              getItemAriaLabel={(type) => (type === 'next' ? 'Página siguiente' : type === 'previous' ? 'Página anterior' : type)}
              sx={{ bgcolor: 'background.paper', border: 1, borderColor: 'divider', borderRadius: '12px' }}
            />
          )}
        </>
      )}

      {canManage && (
        <Fab
          variant="extended"
          color="secondary"
          onClick={() => setCreating(true)}
          sx={{
            display: { md: 'none' },
            position: 'fixed',
            right: 16,
            bottom: 24,
            height: 56,
            borderRadius: '16px',
            px: 2.5,
            textTransform: 'none',
            fontSize: 15,
            boxShadow: '0 6px 16px rgba(0,47,108,0.3)',
          }}
        >
          <AddIcon sx={{ mr: 1 }} />
          Nuevo alumno
        </Fab>
      )}

      {importing && <ImportStudentsForm onClose={() => setImporting(false)} />}
      {creating && <CreateStudentForm onClose={() => setCreating(false)} onCreated={open} />}
    </Box>
  );
}

function emptyMessage({ search, tutorFilter, careerFilter, onlyTutor }) {
  if (search || tutorFilter || careerFilter) return 'Ningún alumno coincide con la búsqueda.';
  if (onlyTutor) return 'Aún no tienes alumnos asignados en la etapa vigente.';
  return 'Aún no hay alumnos registrados.';
}

/** The career groups of the current enrollment: an exam type's careers, or none. */
function CareerFilter({ value, groups, onChange }) {
  return (
    <TextField
      select
      size="small"
      label="Carrera"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      slotProps={{ select: { native: true }, inputLabel: { shrink: true }, htmlInput: { 'aria-label': 'Filtrar por carrera' } }}
      sx={{ flex: { xs: '1 1 100%', sm: '0 1 320px' } }}
    >
      <option value="">Todas las carreras</option>
      {groups.map((group) => (
        <option key={group.value} value={group.value}>
          {group.label}
        </option>
      ))}
      <option value={NO_CAREER}>Sin carrera</option>
    </TextField>
  );
}

/** ADMIN only: every tutor, "Sin tutor asignado" or one active tutor (A–Z by surname, from the backend). */
function TutorFilter({ value, onChange }) {
  const { data: users = [] } = useGetUsersQuery();
  const tutors = users.filter((user) => user.active && user.roles.includes('TUTOR'));
  return (
    <TextField
      select
      size="small"
      label="Tutor"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      slotProps={{ select: { native: true }, inputLabel: { shrink: true }, htmlInput: { 'aria-label': 'Filtrar por tutor' } }}
      sx={{ flex: { xs: '1 1 100%', sm: '0 1 320px' } }}
    >
      <option value="">Todos los tutores</option>
      <option value="none">Sin tutor asignado</option>
      {tutors.map((tutor) => (
        <option key={tutor.id} value={tutor.id}>
          {[tutor.lastNamePat, tutor.lastNameMat].filter(Boolean).join(' ')}, {tutor.firstName}
        </option>
      ))}
    </TextField>
  );
}

/** The current tutor, or a "Sin tutor" chip in warning orange, as in the prototype. */
function TutorLabel({ student }) {
  if (student.tutorName) return student.tutorName;
  return (
    <Box component="span" sx={{ fontSize: 13, fontWeight: 500, px: 1.25, py: 0.375, borderRadius: '12px', bgcolor: '#FFF0DD', color: '#7A4100' }}>
      Sin tutor
    </Box>
  );
}

function Muted({ children }) {
  return (
    <Box component="span" sx={{ color: 'text.secondary' }}>
      {children}
    </Box>
  );
}

function StudentCard({ student, showTutor, onOpen }) {
  return (
    <ButtonBase
      onClick={onOpen}
      aria-label={`Ver ${studentFullName(student)}`}
      sx={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        px: 1.75,
        py: 1.5,
        bgcolor: 'background.paper',
        border: 1,
        borderColor: 'divider',
        borderRadius: '16px',
        textAlign: 'left',
        '&:hover': { borderColor: colors.secondary },
      }}
    >
      <StudentAvatar student={student} size={44} />
      <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 0.375 }}>
        <Typography noWrap sx={{ fontSize: 15, fontWeight: 500 }}>
          {studentFullName(student)}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>{student.dni ? `DNI ${student.dni}` : 'Sin DNI'}</Typography>
          {!student.active && <StudentStatusChip active={false} />}
        </Box>
        {showTutor && (
          <Typography sx={{ fontSize: 12, fontWeight: 500, color: student.tutorName ? '#3A4150' : '#7A4100' }}>
            {student.tutorName ? `Tutor: ${student.tutorName}` : 'Sin tutor asignado'}
          </Typography>
        )}
      </Box>
      <ChevronRightIcon aria-hidden="true" sx={{ fontSize: 20, color: '#8C96A8' }} />
    </ButtonBase>
  );
}

const STATUS = {
  active: { label: 'Activo', bg: '#E8F5D6', fg: '#2F5A08' },
  inactive: { label: 'Inactivo', bg: '#ECEFF3', fg: '#4A5160' },
};

export function StudentStatusChip({ active }) {
  const status = active ? STATUS.active : STATUS.inactive;
  return (
    <Box
      component="span"
      sx={{ fontSize: 12, fontWeight: 500, px: 1.25, py: 0.375, borderRadius: '12px', bgcolor: status.bg, color: status.fg }}
    >
      {status.label}
    </Box>
  );
}

export function StudentAvatar({ student, size }) {
  return (
    <Avatar alt="" sx={{ width: size, height: size, bgcolor: colors.selected, color: colors.primary, fontSize: size * 0.34, fontWeight: 500 }}>
      {studentInitials(student)}
    </Avatar>
  );
}
