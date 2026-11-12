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
const BY_ID = { 1: LUCIA, 2: MATEO };

function json(status, body) {
  return new Response(body === undefined ? null : JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

let fetchMock;
let roles;
let writeResponse;

function route(request) {
  const url = new URL(request.url);
  if (url.pathname.endsWith('/auth/me')) return json(200, { id: 9, firstName: 'A', lastName: 'B', roles });
  if (request.method === 'GET' && url.pathname.endsWith('/students')) {
    const search = (url.searchParams.get('search') ?? '').toLowerCase();
    return json(200, [LUCIA, MATEO].filter((s) => studentFullName(s).toLowerCase().includes(search)));
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

  it('shows the backend message for an unknown student', async () => {
    renderAt('/students/999');

    expect(await screen.findByText('No encontramos el alumno solicitado.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '‹ Alumnos' })).toBeInTheDocument();
  });
});
