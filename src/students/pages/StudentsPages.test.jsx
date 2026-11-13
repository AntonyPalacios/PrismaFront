import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ThemeProvider } from '@mui/material/styles';
import { NotificationProvider } from '../../app/notifications';
import { makeStore } from '../../app/store';
import { theme } from '../../app/theme';
import { toStudentBody } from '../components/studentSchema';
import { studentFullName, studentInitials } from '../studentDisplay';
import StudentDetailPage from './StudentDetailPage';
import StudentsPage from './StudentsPage';

// invented people
const LUCIA = {
  id: 1,
  firstName: 'Lucía',
  lastNamePat: 'Campos',
  lastNameMat: 'Herrera',
  dni: '72814563',
  email: 'lucia@correo.pe',
  phone: '987654321',
  birthDate: '2009-05-17',
  active: true,
};
const MATEO = {
  id: 2,
  firstName: 'Mateo',
  lastNamePat: 'Chávez',
  lastNameMat: null,
  dni: null,
  email: null,
  phone: null,
  birthDate: null,
  active: true,
};
const VALERIA = {
  id: 3,
  firstName: 'Valeria',
  lastNamePat: 'Díaz',
  lastNameMat: null,
  dni: '70011223',
  email: null,
  phone: null,
  birthDate: null,
  active: false,
};
const BY_ID = { 1: LUCIA, 2: MATEO, 3: VALERIA };

function json(status, body) {
  return new Response(body === undefined ? null : JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

// newest stage first, as the backend sends them
const ENROLLMENT_CURRENT = {
  id: 11,
  studentId: 1,
  cycleId: 20,
  cycleName: '2026-II',
  cycleStatus: 'ACTIVE',
  stageId: 31,
  stageName: 'Etapa 2',
  stageStatus: 'ACTIVE',
  careerId: null,
  careerName: null,
  active: true,
};
const ENROLLMENT_WITHDRAWN = {
  ...ENROLLMENT_CURRENT,
  id: 10,
  stageId: 30,
  stageName: 'Etapa 1',
  stageStatus: 'CLOSED',
  careerId: 2,
  careerName: 'Letras',
  active: false,
};
const ENROLLMENT_OLD = {
  ...ENROLLMENT_CURRENT,
  id: 9,
  cycleId: 19,
  cycleName: '2026-I',
  cycleStatus: 'CLOSED',
  stageId: 29,
  stageName: 'Etapa 3',
  stageStatus: 'CLOSED',
  careerId: 1,
  careerName: 'Ciencias',
  tutorId: 51,
  tutorName: 'Vargas Soto, Julia',
};
// tutor history per enrollment, newest first
const TUTOR_HISTORY = {
  9: [
    { id: 72, enrollmentId: 9, tutorId: 51, tutorName: 'Vargas Soto, Julia', validFrom: '2026-03-02T10:00:00-05:00', validTo: null },
    { id: 71, enrollmentId: 9, tutorId: 50, tutorName: 'Ríos Paredes, María', validFrom: '2026-01-05T09:00:00-05:00', validTo: '2026-03-02T10:00:00-05:00' },
  ],
};
const USERS = [
  { id: 52, firstName: 'Jorge', lastNamePat: 'Arce', lastNameMat: 'Delgado', roles: ['TUTOR'], active: true },
  { id: 53, firstName: 'Rosa', lastNamePat: 'Lima', lastNameMat: null, roles: ['COORDINADOR'], active: true },
  { id: 50, firstName: 'María', lastNamePat: 'Ríos', lastNameMat: 'Paredes', roles: ['TUTOR', 'ADMIN'], active: true },
  { id: 54, firstName: 'Ana', lastNamePat: 'Soto', lastNameMat: null, roles: ['TUTOR'], active: false },
  { id: 51, firstName: 'Julia', lastNamePat: 'Vargas', lastNameMat: 'Soto', roles: ['TUTOR'], active: true },
];
const CYCLES = [
  { id: 21, name: '2027-I', status: 'PLANNED' },
  { id: 20, name: '2026-II', status: 'ACTIVE' },
  { id: 19, name: '2026-I', status: 'CLOSED' },
];
const STAGES = {
  20: [
    { id: 30, cycleId: 20, name: 'Etapa 1', status: 'CLOSED' },
    { id: 31, cycleId: 20, name: 'Etapa 2', status: 'ACTIVE' },
    { id: 32, cycleId: 20, name: 'Etapa 3', status: 'PLANNED' },
  ],
  21: [{ id: 40, cycleId: 21, name: 'Etapa 1', status: 'PLANNED' }],
};
const CAREERS = [
  { id: 1, name: 'Ciencias', active: true },
  { id: 2, name: 'Letras', active: true },
  { id: 3, name: 'Artes', active: false },
];

let fetchMock;
let roles;
let writeResponse;
let enrollments;

function route(request) {
  const url = new URL(request.url);
  if (url.pathname.endsWith('/auth/me')) return json(200, { id: 9, firstName: 'A', lastName: 'B', roles });
  if (request.method === 'GET' && url.pathname.endsWith('/enrollments')) return json(200, enrollments);
  if (request.method === 'GET' && url.pathname.endsWith('/cycles')) return json(200, CYCLES);
  if (request.method === 'GET' && url.pathname.endsWith('/careers')) return json(200, CAREERS);
  const tutorsOf = url.pathname.match(/\/enrollments\/(\d+)\/tutor-assignments$/);
  if (request.method === 'GET' && tutorsOf) return json(200, TUTOR_HISTORY[tutorsOf[1]] ?? []);
  if (request.method === 'GET' && url.pathname.endsWith('/users')) return json(200, USERS);
  const stagesOf = url.pathname.match(/\/cycles\/(\d+)\/stages$/);
  if (request.method === 'GET' && stagesOf) return json(200, STAGES[stagesOf[1]] ?? []);
  if (request.method === 'GET' && url.pathname.endsWith('/students')) {
    const search = (url.searchParams.get('search') ?? '').toLowerCase();
    const all = url.searchParams.get('includeInactive') === 'true' ? [LUCIA, VALERIA, MATEO] : [LUCIA, MATEO];
    return json(200, all.filter((s) => studentFullName(s).toLowerCase().includes(search)));
  }
  const detail = url.pathname.match(/\/students\/(\d+)$/);
  if (request.method === 'GET' && detail) {
    return BY_ID[detail[1]]
      ? json(200, BY_ID[detail[1]])
      : json(404, { status: 404, detail: 'No encontramos el alumno solicitado.' });
  }
  return writeResponse(request);
}

function renderAt(path) {
  const router = createMemoryRouter(
    [
      { path: '/students', element: <StudentsPage /> },
      { path: '/students/:id', element: <StudentDetailPage /> },
    ],
    { initialEntries: [path] },
  );
  render(
    <Provider store={makeStore()}>
      <ThemeProvider theme={theme}>
        <NotificationProvider>
          <RouterProvider router={router} />
        </NotificationProvider>
      </ThemeProvider>
    </Provider>,
  );
  return router;
}

const requests = () => fetchMock.mock.calls.map(([r]) => r);
const writes = () => requests().filter((r) => r.method !== 'GET');
const searches = () =>
  requests()
    .map((r) => new URL(r.url))
    .filter((url) => url.pathname.endsWith('/students'))
    .map((url) => url.searchParams.get('search'));

async function openCreateForm() {
  fireEvent.click((await screen.findAllByRole('button', { name: /nuevo alumno/i }))[0]);
  return screen.findByRole('form', { name: 'Nuevo alumno' });
}

const type = (form, label, value) => fireEvent.change(within(form).getByLabelText(label), { target: { value } });

describe('Student display', () => {
  it('shows people as "Apellidos, Nombres" with initials from the paternal surname and the first name', () => {
    expect(studentFullName(LUCIA)).toBe('Campos Herrera, Lucía');
    expect(studentFullName(MATEO)).toBe('Chávez, Mateo');
    expect(studentInitials(LUCIA)).toBe('CL');
  });

  it('sends empty optional fields as null and the DNI in upper case', () => {
    expect(
      toStudentBody({ firstName: 'Mateo', lastNamePat: 'Chávez', lastNameMat: '', dni: 'ce00123456', email: '', phone: '', birthDate: '' }),
    ).toEqual({ firstName: 'Mateo', lastNamePat: 'Chávez', lastNameMat: null, dni: 'CE00123456', email: null, phone: null, birthDate: null });
  });
});

describe('Students screens', () => {
  beforeEach(() => {
    roles = ['TUTOR'];
    enrollments = [];
    writeResponse = () => json(201, MATEO);
    fetchMock = vi.fn((request) => Promise.resolve(route(request)));
    vi.stubGlobal('fetch', fetchMock);
    document.cookie = 'XSRF-TOKEN=csrf-1';
  });

  afterEach(() => vi.unstubAllGlobals());

  it('lists students as "Apellidos, Nombres" with their DNI, in the backend order', async () => {
    renderAt('/students');

    const lucia = (await screen.findByRole('button', { name: 'Ver Campos Herrera, Lucía' })).closest('li');
    expect(within(lucia).getByText('DNI 72814563')).toBeInTheDocument();
    const mateo = screen.getByRole('button', { name: 'Ver Chávez, Mateo' }).closest('li');
    expect(within(mateo).getByText('Sin DNI')).toBeInTheDocument();

    const cards = screen.getAllByRole('button', { name: /^Ver / }).map((card) => card.getAttribute('aria-label'));
    expect(cards).toEqual(['Ver Campos Herrera, Lucía', 'Ver Chávez, Mateo']);
    expect(screen.getByText('2 alumnos activos · orden A–Z por apellido')).toBeInTheDocument();
  });

  it('asks the backend for what is typed in the search box, once the user pauses', async () => {
    renderAt('/students');
    await screen.findByRole('button', { name: 'Ver Chávez, Mateo' });

    fireEvent.change(screen.getByRole('searchbox', { name: 'Buscar alumno' }), { target: { value: ' campos ' } });

    await waitFor(() => expect(screen.queryByRole('button', { name: 'Ver Chávez, Mateo' })).not.toBeInTheDocument());
    expect(screen.getByRole('button', { name: 'Ver Campos Herrera, Lucía' })).toBeInTheDocument();
    expect(screen.getByText('1 alumno para "campos" · orden A–Z por apellido')).toBeInTheDocument();
    expect(searches()).toEqual([null, 'campos']);
  });

  it('says so when nothing matches the search', async () => {
    renderAt('/students');
    await screen.findByRole('button', { name: 'Ver Chávez, Mateo' });

    fireEvent.change(screen.getByRole('searchbox', { name: 'Buscar alumno' }), { target: { value: 'zzz' } });

    expect(await screen.findByText('Ningún alumno coincide con la búsqueda.')).toBeInTheDocument();
  });

  it('flags missing names and invalid data before calling the backend', async () => {
    renderAt('/students');
    const form = await openCreateForm();

    type(form, /DNI/, '123');
    type(form, /Correo/, 'no-es-correo');
    type(form, /Fecha de nacimiento/, '2999-01-01');
    fireEvent.click(within(form).getByRole('button', { name: 'Registrar alumno' }));

    expect(await within(form).findByText('Ingresa los nombres del alumno.')).toBeInTheDocument();
    expect(within(form).getByText('Ingresa el apellido paterno del alumno.')).toBeInTheDocument();
    expect(within(form).getByText('El DNI debe tener entre 8 y 12 letras o números.')).toBeInTheDocument();
    expect(within(form).getByText('El correo no tiene un formato válido.')).toBeInTheDocument();
    expect(within(form).getByText('La fecha de nacimiento no puede ser futura.')).toBeInTheDocument();
    expect(writes()).toHaveLength(0);
  });

  it('registers a student with only the required data', async () => {
    renderAt('/students');
    const form = await openCreateForm();

    type(form, /Nombres/, ' Mateo ');
    type(form, /Apellido paterno/, 'Chávez');
    fireEvent.click(within(form).getByRole('button', { name: 'Registrar alumno' }));

    expect(await screen.findByText('Alumno registrado.')).toBeInTheDocument();
    const [request] = writes();
    expect(request.method).toBe('POST');
    expect(new URL(request.url).pathname).toMatch(/\/students$/);
    expect(request.headers.get('X-XSRF-TOKEN')).toBe('csrf-1');
    expect(await request.json()).toEqual({
      firstName: 'Mateo',
      lastNamePat: 'Chávez',
      lastNameMat: null,
      dni: null,
      email: null,
      phone: null,
      birthDate: null,
    });
  });

  it('keeps the form open with the backend message on a duplicate DNI', async () => {
    writeResponse = () => json(409, { status: 409, detail: 'Ya existe un alumno con ese DNI.' });
    renderAt('/students');
    const form = await openCreateForm();

    type(form, /Nombres/, 'Otra');
    type(form, /Apellido paterno/, 'Persona');
    type(form, /DNI/, '72814563');
    fireEvent.click(within(form).getByRole('button', { name: 'Registrar alumno' }));

    expect(await within(form).findByText('Ya existe un alumno con ese DNI.')).toBeInTheDocument();
    expect(within(form).getByLabelText(/DNI/)).toHaveValue('72814563');
  });

  it('opens a student file from the list', async () => {
    const router = renderAt('/students');

    fireEvent.click(await screen.findByRole('button', { name: 'Ver Campos Herrera, Lucía' }));

    expect(await screen.findByRole('heading', { name: 'Campos Herrera, Lucía' })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/students/1');
  });

  it('shows the file read-only and edits the data', async () => {
    writeResponse = () => json(200, { ...LUCIA, phone: null });
    renderAt('/students/1');

    expect(await screen.findByRole('heading', { name: 'Campos Herrera, Lucía' })).toBeInTheDocument();
    expect(screen.getByText('Activo')).toBeInTheDocument();
    expect(screen.getByText('DNI 72814563')).toBeInTheDocument();
    const form = screen.getByRole('form', { name: 'Datos' });
    expect(within(form).getByLabelText(/Nombres/)).toBeDisabled();
    expect(within(form).getByLabelText(/Fecha de nacimiento/)).toHaveValue('2009-05-17');

    fireEvent.click(screen.getByRole('button', { name: 'Editar' }));
    expect(within(form).getByLabelText(/Nombres/)).toBeEnabled();
    type(form, /Teléfono/, '');
    type(form, /Apellido materno/, 'Herrera Soto');
    fireEvent.click(within(form).getByRole('button', { name: 'Guardar' }));

    expect(await screen.findByText('Alumno actualizado.')).toBeInTheDocument();
    const [request] = writes();
    expect(request.method).toBe('PUT');
    expect(new URL(request.url).pathname).toMatch(/\/students\/1$/);
    expect(await request.json()).toEqual({
      firstName: 'Lucía',
      lastNamePat: 'Campos',
      lastNameMat: 'Herrera Soto',
      dni: '72814563',
      email: 'lucia@correo.pe',
      phone: null,
      birthDate: '2009-05-17',
    });
  });

  it('cancelling an edit restores the data', async () => {
    renderAt('/students/1');
    fireEvent.click(await screen.findByRole('button', { name: 'Editar' }));
    let form = screen.getByRole('form', { name: 'Datos' });

    type(form, /Nombres/, 'Otro nombre');
    fireEvent.click(within(form).getByRole('button', { name: 'Cancelar' }));

    form = screen.getByRole('form', { name: 'Datos' });
    expect(within(form).getByLabelText(/Nombres/)).toHaveValue('Lucía');
    expect(within(form).getByLabelText(/Nombres/)).toBeDisabled();
    expect(writes()).toHaveLength(0);
  });

  it('after emptying the fields and cancelling, the labels sit above the restored data', async () => {
    renderAt('/students/1');
    fireEvent.click(await screen.findByRole('button', { name: 'Editar' }));
    let form = screen.getByRole('form', { name: 'Datos' });
    const fields = [/Nombres/, /Apellido paterno/, /Apellido materno/, /DNI/, /Correo/, /Teléfono/];

    fields.forEach((label) => type(form, label, ''));
    fireEvent.click(within(form).getByRole('button', { name: 'Cancelar' }));

    // MUI keeps a label down (over the text) unless it knows the field is filled
    form = screen.getByRole('form', { name: 'Datos' });
    fields.forEach((label) => {
      const input = within(form).getByLabelText(label);
      expect(form.querySelector(`label[for="${input.id}"]`)).toHaveAttribute('data-shrink', 'true');
    });
    expect(within(form).getByLabelText(/Nombres/)).toHaveValue('Lucía');

    // and so they stay when editing again
    fireEvent.click(screen.getByRole('button', { name: 'Editar' }));
    form = screen.getByRole('form', { name: 'Datos' });
    const name = within(form).getByLabelText(/Nombres/);
    expect(form.querySelector(`label[for="${name.id}"]`)).toHaveAttribute('data-shrink', 'true');
  });

  it('lets a coordinator see and search students, without create or edit actions', async () => {
    roles = ['COORDINADOR'];
    renderAt('/students');

    expect(await screen.findByRole('button', { name: 'Ver Campos Herrera, Lucía' })).toBeInTheDocument();
    expect(screen.getByRole('searchbox', { name: 'Buscar alumno' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /nuevo alumno/i })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Ver Campos Herrera, Lucía' }));
    expect(await screen.findByRole('heading', { name: 'Campos Herrera, Lucía' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Editar' })).not.toBeInTheDocument();
  });

  it.each([['TUTOR'], ['COORDINADOR']])('lets a %s show inactive students and open their file, without retire actions', async (role) => {
    roles = [role];
    renderAt('/students');
    await screen.findByRole('button', { name: 'Ver Chávez, Mateo' });
    expect(screen.queryByRole('button', { name: 'Ver Díaz, Valeria' })).not.toBeInTheDocument();

    fireEvent.click(screen.getByLabelText('Mostrar inactivos'));

    const valeria = (await screen.findByRole('button', { name: 'Ver Díaz, Valeria' })).closest('li');
    expect(within(valeria).getByText('Inactivo')).toBeInTheDocument();
    expect(screen.getByText('3 alumnos · 1 inactivo · orden A–Z por apellido')).toBeInTheDocument();
    const lastList = requests()
      .map((r) => new URL(r.url))
      .filter((url) => url.pathname.endsWith('/students'))
      .at(-1);
    expect(lastList.searchParams.get('includeInactive')).toBe('true');

    fireEvent.click(screen.getByRole('button', { name: 'Ver Díaz, Valeria' }));
    expect(await screen.findByRole('heading', { name: 'Díaz, Valeria' })).toBeInTheDocument();
    expect(screen.getByText(/Su historial sigue intacto/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Editar' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Reactivar' })).not.toBeInTheDocument();
  });

  it('a tutor cannot retire an active student', async () => {
    renderAt('/students/1');

    expect(await screen.findByRole('button', { name: 'Editar' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Dar de baja' })).not.toBeInTheDocument();
  });

  it('an admin retires a student after confirming', async () => {
    roles = ['ADMIN'];
    writeResponse = () => json(204);
    renderAt('/students/1');

    fireEvent.click(await screen.findByRole('button', { name: 'Dar de baja' }));
    const dialog = await screen.findByRole('dialog', { name: '¿Dar de baja al alumno?' });
    expect(writes()).toHaveLength(0);
    fireEvent.click(within(dialog).getByRole('button', { name: 'Dar de baja' }));

    expect(await screen.findByText('Alumno dado de baja.')).toBeInTheDocument();
    const [request] = writes();
    expect(request.method).toBe('DELETE');
    expect(new URL(request.url).pathname).toMatch(/\/students\/1$/);
    expect(request.headers.get('X-XSRF-TOKEN')).toBe('csrf-1');
  });

  it('an admin reactivates an inactive student, who cannot be edited meanwhile', async () => {
    roles = ['ADMIN'];
    writeResponse = () => json(200, { ...VALERIA, active: true });
    renderAt('/students/3');

    expect(await screen.findByRole('heading', { name: 'Díaz, Valeria' })).toBeInTheDocument();
    expect(screen.getByText('Inactivo')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Editar' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Dar de baja' })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Reactivar' }));

    expect(await screen.findByText('Alumno reactivado.')).toBeInTheDocument();
    const [request] = writes();
    expect(request.method).toBe('POST');
    expect(new URL(request.url).pathname).toMatch(/\/students\/3\/reactivate$/);
  });

  it('shows the backend message for an unknown student', async () => {
    renderAt('/students/999');

    expect(await screen.findByText('No encontramos el alumno solicitado.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '‹ Alumnos' })).toBeInTheDocument();
  });
});

describe('Enrollments in the student file', () => {
  beforeEach(() => {
    roles = ['TUTOR'];
    enrollments = [ENROLLMENT_CURRENT, ENROLLMENT_WITHDRAWN, ENROLLMENT_OLD];
    writeResponse = () => json(201, ENROLLMENT_CURRENT);
    fetchMock = vi.fn((request) => Promise.resolve(route(request)));
    vi.stubGlobal('fetch', fetchMock);
    document.cookie = 'XSRF-TOKEN=csrf-1';
  });

  afterEach(() => vi.unstubAllGlobals());

  const section = () => screen.findByRole('region', { name: 'Matrículas' });
  const card = (s, name) => within(s).getByRole('button', { name: `Matrícula ${name}` }).closest('li');

  it('shows the history with career and status, newest stage first', async () => {
    renderAt('/students/1');
    const s = await section();

    await within(s).findByRole('button', { name: 'Matrícula 2026-II · Etapa 2' });
    const cards = within(s).getAllByRole('button', { name: /^Matrícula / }).map((b) => b.getAttribute('aria-label'));
    expect(cards).toEqual(['Matrícula 2026-II · Etapa 2', 'Matrícula 2026-II · Etapa 1', 'Matrícula 2026-I · Etapa 3']);
    expect(within(card(s, '2026-II · Etapa 2')).getByText('Sin definir · Sin tutor')).toBeInTheDocument();
    expect(within(card(s, '2026-I · Etapa 3')).getByText('Ciencias · Vargas Soto, Julia')).toBeInTheDocument();
    expect(within(card(s, '2026-II · Etapa 2')).getByText('Activa')).toBeInTheDocument();
    expect(within(card(s, '2026-II · Etapa 1')).getByText('Retirada')).toBeInTheDocument();
    expect(within(card(s, '2026-I · Etapa 3')).getByText('Cerrada')).toBeInTheDocument();
    const request = requests().find((r) => new URL(r.url).pathname.endsWith('/enrollments'));
    expect(new URL(request.url).searchParams.get('studentId')).toBe('1');
  });

  it('a coordinator does not see enrollments', async () => {
    roles = ['COORDINADOR'];
    renderAt('/students/1');

    expect(await screen.findByRole('heading', { name: 'Campos Herrera, Lucía' })).toBeInTheDocument();
    expect(screen.queryByRole('region', { name: 'Matrículas' })).not.toBeInTheDocument();
    expect(requests().some((r) => new URL(r.url).pathname.endsWith('/enrollments'))).toBe(false);
  });

  it('an inactive student shows the history but cannot be enrolled', async () => {
    renderAt('/students/3');
    const s = await section();

    expect(await within(s).findByRole('button', { name: 'Matrícula 2026-II · Etapa 2' })).toBeInTheDocument();
    expect(within(s).queryByRole('button', { name: '+ Nueva matrícula' })).not.toBeInTheDocument();
  });

  it('enrolls in a stage of an open cycle the student is not in yet, with an optional career', async () => {
    renderAt('/students/1');
    fireEvent.click(within(await section()).getByRole('button', { name: '+ Nueva matrícula' }));
    const form = await screen.findByRole('form', { name: 'Nueva matrícula' });

    // the active cycle comes first; closed cycles are not offered
    const cycle = within(form).getByLabelText('Ciclo');
    await waitFor(() => expect(cycle).toHaveValue('20'));
    expect(within(cycle).queryByRole('option', { name: '2026-I' })).not.toBeInTheDocument();
    // stages already enrolled (active or withdrawn) are not offered
    const stage = within(form).getByLabelText(/Etapa/);
    await within(stage).findByRole('option', { name: 'Etapa 3' });
    expect(within(stage).getAllByRole('option').map((o) => o.textContent)).toEqual(['Elige una etapa…', 'Etapa 3']);
    // only active careers
    const career = within(form).getByLabelText(/Carrera/);
    await within(career).findByRole('option', { name: 'Letras' });
    expect(within(career).queryByRole('option', { name: 'Artes' })).not.toBeInTheDocument();

    fireEvent.click(within(form).getByRole('button', { name: 'Matricular' }));
    expect(await within(form).findByText('Elige la etapa de la matrícula.')).toBeInTheDocument();
    expect(writes()).toHaveLength(0);

    fireEvent.change(stage, { target: { value: '32' } });
    fireEvent.change(career, { target: { value: '2' } });
    fireEvent.click(within(form).getByRole('button', { name: 'Matricular' }));

    expect(await screen.findByText('Alumno matriculado.')).toBeInTheDocument();
    const [request] = writes();
    expect(request.method).toBe('POST');
    expect(new URL(request.url).pathname).toMatch(/\/enrollments$/);
    expect(request.headers.get('X-XSRF-TOKEN')).toBe('csrf-1');
    expect(await request.json()).toEqual({ studentId: 1, stageId: 32, careerId: 2 });
  });

  it('changing the cycle offers its stages', async () => {
    renderAt('/students/1');
    fireEvent.click(within(await section()).getByRole('button', { name: '+ Nueva matrícula' }));
    const form = await screen.findByRole('form', { name: 'Nueva matrícula' });
    const cycle = within(form).getByLabelText('Ciclo');
    await waitFor(() => expect(cycle).toHaveValue('20'));

    fireEvent.change(cycle, { target: { value: '21' } });

    const stage = within(form).getByLabelText(/Etapa/);
    await within(stage).findByRole('option', { name: 'Etapa 1' });
    fireEvent.change(stage, { target: { value: '40' } });
    fireEvent.click(within(form).getByRole('button', { name: 'Matricular' }));

    await screen.findByText('Alumno matriculado.');
    expect(await writes()[0].json()).toEqual({ studentId: 1, stageId: 40, careerId: null });
  });

  it('keeps the form open with the backend message', async () => {
    writeResponse = () => json(409, { status: 409, detail: 'No se puede matricular en una etapa de un ciclo cerrado.' });
    renderAt('/students/1');
    fireEvent.click(within(await section()).getByRole('button', { name: '+ Nueva matrícula' }));
    const form = await screen.findByRole('form', { name: 'Nueva matrícula' });
    const stage = within(form).getByLabelText(/Etapa/);
    await within(stage).findByRole('option', { name: 'Etapa 3' });

    fireEvent.change(stage, { target: { value: '32' } });
    fireEvent.click(within(form).getByRole('button', { name: 'Matricular' }));

    expect(await within(form).findByText('No se puede matricular en una etapa de un ciclo cerrado.')).toBeInTheDocument();
  });

  it('saves the career of an active enrollment', async () => {
    writeResponse = () => json(200, { ...ENROLLMENT_CURRENT, careerId: 1, careerName: 'Ciencias' });
    renderAt('/students/1');
    const s = await section();
    fireEvent.click(await within(s).findByRole('button', { name: 'Matrícula 2026-II · Etapa 2' }));
    const form = await screen.findByRole('form', { name: 'Matrícula' });

    const career = within(form).getByLabelText(/Carrera/);
    await within(career).findByRole('option', { name: 'Ciencias' });
    fireEvent.change(career, { target: { value: '1' } });
    fireEvent.click(within(form).getByRole('button', { name: 'Guardar' }));

    expect(await screen.findByText('Carrera guardada.')).toBeInTheDocument();
    const [request] = writes();
    expect(request.method).toBe('PUT');
    expect(new URL(request.url).pathname).toMatch(/\/enrollments\/11$/);
    expect(await request.json()).toEqual({ careerId: 1 });
  });

  it('withdraws from the stage after confirming', async () => {
    writeResponse = () => json(204);
    renderAt('/students/1');
    fireEvent.click(await within(await section()).findByRole('button', { name: 'Matrícula 2026-II · Etapa 2' }));
    const form = await screen.findByRole('form', { name: 'Matrícula' });

    fireEvent.click(within(form).getByRole('button', { name: 'Retirar de la etapa' }));
    const dialog = await screen.findByRole('dialog', { name: '¿Retirar de la etapa?' });
    expect(writes()).toHaveLength(0);
    fireEvent.click(within(dialog).getByRole('button', { name: 'Retirar' }));

    expect(await screen.findByText('Alumno retirado de la etapa.')).toBeInTheDocument();
    const [request] = writes();
    expect(request.method).toBe('DELETE');
    expect(new URL(request.url).pathname).toMatch(/\/enrollments\/11$/);
  });

  it.each([
    ['2026-II · Etapa 1', 'El alumno se retiró de esta etapa: la matrícula queda como historial.', 'Letras'],
    ['2026-I · Etapa 3', 'Esta matrícula es de un ciclo cerrado: queda como historial.', 'Ciencias'],
  ])('opens %s read-only', async (name, note, careerName) => {
    renderAt('/students/1');
    fireEvent.click(await within(await section()).findByRole('button', { name: `Matrícula ${name}` }));
    const form = await screen.findByRole('form', { name: 'Matrícula' });

    expect(within(form).getByText(note)).toBeInTheDocument();
    expect(within(form).getByText(careerName)).toBeInTheDocument();
    expect(within(form).queryByLabelText(/Carrera/)).not.toBeInTheDocument();
    expect(within(form).queryByRole('button', { name: 'Guardar' })).not.toBeInTheDocument();
    expect(within(form).queryByRole('button', { name: 'Retirar de la etapa' })).not.toBeInTheDocument();
  });
});

describe('Tutor of an enrollment', () => {
  beforeEach(() => {
    roles = ['TUTOR'];
    enrollments = [ENROLLMENT_CURRENT, ENROLLMENT_WITHDRAWN, ENROLLMENT_OLD];
    writeResponse = () => json(201, TUTOR_HISTORY[9][0]);
    fetchMock = vi.fn((request) => Promise.resolve(route(request)));
    vi.stubGlobal('fetch', fetchMock);
    document.cookie = 'XSRF-TOKEN=csrf-1';
  });

  afterEach(() => vi.unstubAllGlobals());

  async function openEnrollment(name) {
    renderAt('/students/1');
    const s = await screen.findByRole('region', { name: 'Matrículas' });
    fireEvent.click(await within(s).findByRole('button', { name: `Matrícula ${name}` }));
    const form = await screen.findByRole('form', { name: 'Matrícula' });
    return within(form).getByRole('region', { name: 'Tutor' });
  }

  it('a tutor sees the current tutor and the history, without the selector', async () => {
    enrollments = [{ ...ENROLLMENT_OLD, cycleStatus: 'ACTIVE', stageStatus: 'ACTIVE' }];
    const card = await openEnrollment('2026-I · Etapa 3');

    expect(await within(card).findByText('Vigente desde 02 mar 2026')).toBeInTheDocument();
    const history = within(card).getByRole('list', { name: 'Historial de tutores' });
    const rows = within(history).getAllByRole('listitem').map((li) => li.textContent);
    expect(rows).toEqual(['Vargas Soto, Julia02 mar – vigente', 'Ríos Paredes, María05 ene – 02 mar']);
    expect(within(card).queryByRole('button', { name: /tutor$/ })).not.toBeInTheDocument();
    expect(requests().some((r) => new URL(r.url).pathname.endsWith('/users'))).toBe(false);
  });

  it('an enrollment without tutor says so', async () => {
    const card = await openEnrollment('2026-II · Etapa 2');

    expect(await within(card).findByText('Sin tutor asignado')).toBeInTheDocument();
    expect(within(card).queryByRole('list', { name: 'Historial de tutores' })).not.toBeInTheDocument();
  });

  it('an admin assigns a tutor among the active tutors', async () => {
    roles = ['ADMIN'];
    const card = await openEnrollment('2026-II · Etapa 2');

    const select = await within(card).findByLabelText('Tutor (A–Z por apellido)');
    await within(select).findByRole('option', { name: 'Arce Delgado, Jorge' });
    // active users with the TUTOR role only, in the backend's order
    expect(within(select).getAllByRole('option').map((o) => o.textContent)).toEqual([
      'Elige un tutor…',
      'Arce Delgado, Jorge',
      'Ríos Paredes, María',
      'Vargas Soto, Julia',
    ]);
    const button = within(card).getByRole('button', { name: 'Asignar tutor' });
    expect(button).toBeDisabled();

    fireEvent.change(select, { target: { value: '52' } });
    fireEvent.click(button);

    expect(await screen.findByText('Tutor asignado.')).toBeInTheDocument();
    const [request] = writes();
    expect(request.method).toBe('POST');
    expect(new URL(request.url).pathname).toMatch(/\/enrollments\/11\/tutor-assignments$/);
    expect(request.headers.get('X-XSRF-TOKEN')).toBe('csrf-1');
    expect(await request.json()).toEqual({ tutorUserId: 52 });
  });

  it('an admin reassigns: the current tutor is not offered again', async () => {
    roles = ['ADMIN'];
    enrollments = [{ ...ENROLLMENT_OLD, cycleStatus: 'ACTIVE', stageStatus: 'ACTIVE' }];
    const card = await openEnrollment('2026-I · Etapa 3');

    const select = await within(card).findByLabelText('Nuevo tutor (A–Z por apellido)');
    await within(select).findByRole('option', { name: 'Arce Delgado, Jorge' });
    expect(within(select).queryByRole('option', { name: 'Vargas Soto, Julia' })).not.toBeInTheDocument();

    fireEvent.change(select, { target: { value: '50' } });
    fireEvent.click(within(card).getByRole('button', { name: 'Reasignar tutor' }));

    expect(await screen.findByText('Tutor reasignado.')).toBeInTheDocument();
    expect(await writes()[0].json()).toEqual({ tutorUserId: 50 });
  });

  it('a closed-cycle enrollment shows the history without the selector, even for an admin', async () => {
    roles = ['ADMIN'];
    const card = await openEnrollment('2026-I · Etapa 3');

    expect(await within(card).findByText('Vigente desde 02 mar 2026')).toBeInTheDocument();
    expect(within(card).getByRole('list', { name: 'Historial de tutores' })).toBeInTheDocument();
    expect(within(card).queryByLabelText(/tutor \(A–Z/i)).not.toBeInTheDocument();
    expect(within(card).queryByRole('button', { name: /tutor$/ })).not.toBeInTheDocument();
  });
});
