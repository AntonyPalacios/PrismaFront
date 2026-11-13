import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
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
import Table from '@mui/material/Table';
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
import { useGetStudentsQuery } from '../api/studentsApi';
import CreateStudentForm from '../components/CreateStudentForm';
import { studentFullName, studentInitials, useCanManageStudents } from '../studentDisplay';

const SEARCH_DELAY_MS = 300;

/** What was typed, once the user pauses: one request per pause, not per key. */
function useDebounced(value, delayMs) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);
  return debounced;
}

/**
 * "Alumnos" (Claude Design: StudentsMobile / StudentsDesktop). A search box
 * (name or DNI, resolved by the backend), cards on mobile and a table on
 * desktop, always in the backend's A–Z order by surnames. A row opens the
 * student's file. Inactive (retired) students only appear with "Mostrar
 * inactivos", for every role. The tutor filter and each student's tutor arrive with
 * enrollment and tutoring.
 */
export default function StudentsPage() {
  const navigate = useNavigate();
  const canManage = useCanManageStudents();
  const [typed, setTyped] = useState('');
  const [creating, setCreating] = useState(false);
  const [includeInactive, setIncludeInactive] = useState(false);
  const search = useDebounced(typed.trim(), SEARCH_DELAY_MS);
  const { data: students = [], isLoading, isFetching, error } = useGetStudentsQuery({ search, includeInactive });
  const open = (student) => navigate(`/students/${student.id}`);

  const inactiveCount = students.filter((student) => !student.active).length;
  const count = `${students.length} ${students.length === 1 ? 'alumno' : 'alumnos'}`;
  let countLabel = search ? `${count} para "${search}"` : count;
  if (includeInactive) {
    countLabel += ` · ${inactiveCount} ${inactiveCount === 1 ? 'inactivo' : 'inactivos'}`;
  } else if (!search) {
    countLabel += ` ${students.length === 1 ? 'activo' : 'activos'}`;
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 1080, pb: { xs: 10, md: 0 } }}>
      <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'flex-end', justifyContent: 'space-between', gap: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <Typography component="h1" sx={{ fontSize: 28, fontWeight: 500 }}>
            Alumnos
          </Typography>
          <Typography sx={{ fontSize: 14, color: 'text.secondary' }}>La ficha de cada alumno de la academia.</Typography>
        </Box>
        {canManage && (
          <Button variant="contained" color="secondary" startIcon={<AddIcon />} onClick={() => setCreating(true)}>
            Nuevo alumno
          </Button>
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
            onChange={(e) => setTyped(e.target.value)}
            placeholder="Buscar por apellido, nombre o DNI"
            inputProps={{ 'aria-label': 'Buscar alumno' }}
            sx={{ flex: 1, minWidth: 0, fontSize: 15 }}
          />
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
          <Typography role="status" sx={{ fontSize: 12, color: 'text.secondary' }}>
            {isLoading || isFetching ? 'Buscando…' : `${countLabel} · orden A–Z por apellido`}
          </Typography>
          <FormControlLabel
            labelPlacement="start"
            control={<Switch size="small" checked={includeInactive} onChange={(e) => setIncludeInactive(e.target.checked)} />}
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
          {search ? 'Ningún alumno coincide con la búsqueda.' : 'Aún no hay alumnos registrados.'}
        </Typography>
      )}

      {!isLoading && !error && students.length > 0 && (
        <>
          {/* mobile */}
          <Box
            component="ul"
            sx={{ display: { xs: 'flex', md: 'none' }, listStyle: 'none', m: 0, p: 0, flexDirection: 'column', gap: 1.25 }}
          >
            {students.map((student) => (
              <Box component="li" key={student.id}>
                <StudentCard student={student} onOpen={() => open(student)} />
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
                  <TableCell>Correo</TableCell>
                  <TableCell>Teléfono</TableCell>
                  <TableCell>Estado</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {students.map((student) => (
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
                    <TableCell>{student.email ?? <Muted>—</Muted>}</TableCell>
                    <TableCell>{student.phone ?? <Muted>—</Muted>}</TableCell>
                    <TableCell>
                      <StudentStatusChip active={student.active} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
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

      {creating && <CreateStudentForm onClose={() => setCreating(false)} />}
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

function StudentCard({ student, onOpen }) {
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
