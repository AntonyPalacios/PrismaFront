import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ThemeProvider } from '@mui/material/styles';
import { NotificationProvider } from '../../app/notifications';
import { makeStore } from '../../app/store';
import { theme } from '../../app/theme';
import AdminRoute from '../components/AdminRoute';
import UserDetailPage from './UserDetailPage';
import UsersPage from './UsersPage';

const ANTONY = {
  id: 1,
  email: 'apalaciosc0109@gmail.com',
  firstName: 'Antony',
  lastNamePat: 'Palacios',
  lastNameMat: 'Coronado',
  roles: ['ADMIN'],
  active: true,
  photoUrl: null,
  permanentAdmin: true,
};
const JULIA = {
  id: 7,
  email: 'julia.vargas@prisma.edu.pe',
  firstName: 'Julia',
  lastNamePat: 'Vargas',
  lastNameMat: 'Soto',
  roles: ['COORDINADOR', 'TUTOR'],
  active: true,
  photoUrl: null,
  permanentAdmin: false,
};
const PEDRO = {
  id: 9,
  email: 'pedro@prisma.edu.pe',
  firstName: 'Pedro',
  lastNamePat: 'Zapata',
  lastNameMat: null,
  roles: ['TUTOR'],
  active: false,
  photoUrl: null,
  permanentAdmin: false,
};
const BY_ID = { 1: ANTONY, 7: JULIA, 9: PEDRO };

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
  if (url.pathname.endsWith('/auth/me')) return json(200, { id: 1, firstName: 'A', lastName: 'B', roles });
  if (request.method === 'GET' && url.pathname.endsWith('/users')) {
    const all = url.searchParams.get('includeInactive') === 'true';
    return json(200, [ANTONY, JULIA, PEDRO].filter((u) => all || u.active));
  }
  const detail = url.pathname.match(/\/users\/(\d+)$/);
  if (request.method === 'GET' && detail) return json(200, BY_ID[detail[1]]);
  return writeResponse(request);
}

function renderAt(path) {
  const router = createMemoryRouter(
    [
      { path: '/', element: <p>Inicio</p> },
      {
        element: <AdminRoute />,
        children: [
          { path: '/users', element: <UsersPage /> },
          { path: '/users/:id', element: <UserDetailPage /> },
        ],
      },
    ],
    { initialEntries: [path] },
  );
  const store = makeStore();
  render(
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <NotificationProvider>
          <RouterProvider router={router} />
        </NotificationProvider>
      </ThemeProvider>
    </Provider>,
  );
  return router;
}

const writes = () => fetchMock.mock.calls.map(([r]) => r).filter((r) => r.method !== 'GET');

async function openCreateForm() {
  fireEvent.click((await screen.findAllByRole('button', { name: /nuevo usuario/i }))[0]);
  return screen.findByRole('form', { name: 'Nuevo usuario' });
}

describe('Users screens', () => {
  beforeEach(() => {
    roles = ['ADMIN'];
    writeResponse = () => json(201, JULIA);
    fetchMock = vi.fn((request) => Promise.resolve(route(request)));
    vi.stubGlobal('fetch', fetchMock);
    document.cookie = 'XSRF-TOKEN=csrf-1';
  });

  afterEach(() => vi.unstubAllGlobals());

  it('lists active users as "Apellidos, Nombres" with role chips, inactive ones on demand', async () => {
    renderAt('/users');

    const julia = (await screen.findByRole('button', { name: 'Ver Vargas Soto, Julia' })).closest('li');
    expect(within(julia).getByText('julia.vargas@prisma.edu.pe')).toBeInTheDocument();
    expect(within(julia).getByText('TUTOR')).toBeInTheDocument();
    expect(within(julia).getByText('COORDINADOR')).toBeInTheDocument();
    expect(screen.getByText('2 activos · A–Z por apellido')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Ver Zapata, Pedro' })).not.toBeInTheDocument();

    fireEvent.click(screen.getByLabelText('Mostrar inactivos'));

    const pedro = (await screen.findByRole('button', { name: 'Ver Zapata, Pedro' })).closest('li');
    expect(within(pedro).getByText('Inactivo')).toBeInTheDocument();
  });

  it('sends non-admins back home', async () => {
    roles = ['TUTOR'];
    const router = renderAt('/users');

    expect(await screen.findByText('Inicio')).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/');
  });

  it('flags missing data and roles before calling the backend', async () => {
    renderAt('/users');
    const form = await openCreateForm();

    fireEvent.click(within(form).getByRole('button', { name: 'Crear usuario' }));

    expect(await within(form).findByText('Ingresa el correo del usuario.')).toBeInTheDocument();
    expect(within(form).getByText('Ingresa los nombres del usuario.')).toBeInTheDocument();
    expect(within(form).getByText('Ingresa el apellido paterno del usuario.')).toBeInTheDocument();
    expect(within(form).getByText('Selecciona al menos un rol.')).toBeInTheDocument();
    expect(writes()).toHaveLength(0);
  });

  it('creates a user with several roles', async () => {
    renderAt('/users');
    const form = await openCreateForm();

    fireEvent.change(within(form).getByLabelText(/Correo/), { target: { value: 'julia.vargas@prisma.edu.pe' } });
    fireEvent.change(within(form).getByLabelText(/Nombres/), { target: { value: 'Julia' } });
    fireEvent.change(within(form).getByLabelText(/Apellido paterno/), { target: { value: 'Vargas' } });
    fireEvent.click(within(form).getByRole('checkbox', { name: 'COORDINADOR' }));
    fireEvent.click(within(form).getByRole('checkbox', { name: 'TUTOR' }));
    fireEvent.click(within(form).getByRole('button', { name: 'Crear usuario' }));

    expect(await screen.findByText(/Usuario creado/)).toBeInTheDocument();
    const [request] = writes();
    expect(request.method).toBe('POST');
    expect(request.headers.get('X-XSRF-TOKEN')).toBe('csrf-1');
    expect(await request.json()).toEqual({
      email: 'julia.vargas@prisma.edu.pe',
      firstName: 'Julia',
      lastNamePat: 'Vargas',
      lastNameMat: null,
      roles: ['TUTOR', 'COORDINADOR'],
    });
  });

  it('keeps the form open with the backend message on a duplicate email', async () => {
    writeResponse = () => json(409, { status: 409, detail: 'Ya existe un usuario con ese correo.' });
    renderAt('/users');
    const form = await openCreateForm();

    fireEvent.change(within(form).getByLabelText(/Correo/), { target: { value: 'julia.vargas@prisma.edu.pe' } });
    fireEvent.change(within(form).getByLabelText(/Nombres/), { target: { value: 'Julia' } });
    fireEvent.change(within(form).getByLabelText(/Apellido paterno/), { target: { value: 'Vargas' } });
    fireEvent.click(within(form).getByRole('checkbox', { name: 'TUTOR' }));
    fireEvent.click(within(form).getByRole('button', { name: 'Crear usuario' }));

    expect(await within(form).findByText('Ya existe un usuario con ese correo.')).toBeInTheDocument();
    expect(within(form).getByLabelText(/Correo/)).toHaveValue('julia.vargas@prisma.edu.pe');
  });

  it('opens the detail read-only and edits names and roles, never the email', async () => {
    writeResponse = () => json(200, { ...JULIA, roles: ['TUTOR'] });
    renderAt('/users/7');

    expect(await screen.findByRole('heading', { name: 'Vargas Soto, Julia' })).toBeInTheDocument();
    expect(screen.getByLabelText(/Nombres/)).toBeDisabled();
    expect(screen.getByLabelText('Correo (no editable)')).toBeDisabled();

    fireEvent.click(screen.getByRole('button', { name: 'Editar' }));
    expect(screen.getByLabelText(/Nombres/)).toBeEnabled();
    expect(screen.getByLabelText('Correo (no editable)')).toBeDisabled();
    fireEvent.click(screen.getByRole('checkbox', { name: 'COORDINADOR' }));
    fireEvent.click(screen.getByRole('button', { name: 'Guardar' }));

    expect(await screen.findByText('Usuario actualizado.')).toBeInTheDocument();
    const [request] = writes();
    expect(request.method).toBe('PUT');
    expect(new URL(request.url).pathname).toBe('/api/v1/users/7');
    expect(await request.json()).toEqual({ firstName: 'Julia', lastNamePat: 'Vargas', lastNameMat: 'Soto', roles: ['TUTOR'] });
  });

  it('after emptying the fields and cancelling, the data and the labels are back in place', async () => {
    renderAt('/users/7');
    fireEvent.click(await screen.findByRole('button', { name: 'Editar' }));
    const fields = [/Nombres/, /Apellido paterno/, /Apellido materno/];

    fields.forEach((label) => fireEvent.change(screen.getByLabelText(label), { target: { value: '' } }));
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));

    // MUI keeps a label down (over the text) unless it knows the field is filled
    fields.forEach((label) => {
      const input = screen.getByLabelText(label);
      expect(input).toBeDisabled();
      expect(document.querySelector(`label[for="${input.id}"]`)).toHaveAttribute('data-shrink', 'true');
    });
    expect(screen.getByLabelText(/Nombres/)).toHaveValue('Julia');
    expect(writes()).toHaveLength(0);
  });

  it('deactivates only after confirming, with non-destructive wording', async () => {
    writeResponse = () => new Response(null, { status: 204 });
    renderAt('/users/7');

    fireEvent.click(await screen.findByRole('button', { name: 'Desactivar' }));
    expect(writes()).toHaveLength(0);
    expect(screen.queryByRole('button', { name: 'Reactivar' })).not.toBeInTheDocument();

    const dialog = await screen.findByRole('dialog', { name: '¿Desactivar usuario?' });
    expect(within(dialog).getByText(/permanece intacto/)).toBeInTheDocument();
    expect(within(dialog).queryByText(/eliminar/i)).not.toBeInTheDocument();
    fireEvent.click(within(dialog).getByRole('button', { name: 'Desactivar' }));

    expect(await screen.findByText('Usuario desactivado.')).toBeInTheDocument();
    const [request] = writes();
    expect(request.method).toBe('DELETE');
    expect(new URL(request.url).pathname).toBe('/api/v1/users/7');
  });

  it('reactivates an inactive user directly, without edit or deactivate buttons', async () => {
    writeResponse = () => json(200, { ...PEDRO, active: true });
    renderAt('/users/9');

    fireEvent.click(await screen.findByRole('button', { name: 'Reactivar' }));
    expect(screen.queryByRole('button', { name: 'Desactivar' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Editar' })).not.toBeInTheDocument();

    expect(await screen.findByText('Usuario reactivado.')).toBeInTheDocument();
    const [request] = writes();
    expect(request.method).toBe('POST');
    expect(new URL(request.url).pathname).toBe('/api/v1/users/9/reactivate');
  });

  it('protects the permanent admin: no deactivate, ADMIN role locked', async () => {
    renderAt('/users/1');

    expect(await screen.findByRole('heading', { name: 'Palacios Coronado, Antony' })).toBeInTheDocument();
    await waitFor(() => expect(screen.getByRole('button', { name: 'Editar' })).toBeInTheDocument());
    expect(screen.queryByRole('button', { name: 'Desactivar' })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Editar' }));
    expect(screen.getByRole('checkbox', { name: 'ADMIN' })).toBeDisabled();
    expect(screen.getByRole('checkbox', { name: 'TUTOR' })).toBeEnabled();
  });
});
