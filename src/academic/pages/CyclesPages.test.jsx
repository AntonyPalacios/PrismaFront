import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ThemeProvider } from '@mui/material/styles';
import { NotificationProvider } from '../../app/notifications';
import { makeStore } from '../../app/store';
import { theme } from '../../app/theme';
import AdminRoute from '../../users/components/AdminRoute';
import { cycleDates, formatDate } from '../cycleDisplay';
import CycleDetailPage from './CycleDetailPage';
import CyclesPage from './CyclesPage';

const NEXT = { id: 3, name: '2026-II', startDate: '2026-08-04', endDate: null, status: 'PLANNED' };
const CURRENT = { id: 2, name: '2026-I', startDate: '2026-03-01', endDate: '2026-07-31', status: 'ACTIVE' };
const PAST = { id: 1, name: '2025-II', startDate: '2025-08-01', endDate: '2025-12-15', status: 'CLOSED' };
// active cycles for the "Cerrar ciclo" cases, with dates that don't depend on the day the tests run
const ACTIVE_ENDED = { id: 4, name: 'Terminado', startDate: '2020-01-01', endDate: '2020-12-31', status: 'ACTIVE' };
const ACTIVE_RUNNING = { id: 5, name: 'En curso', startDate: '2020-01-01', endDate: '2999-12-31', status: 'ACTIVE' };
const ACTIVE_OPEN = { id: 6, name: 'Sin fin', startDate: '2020-01-01', endDate: null, status: 'ACTIVE' };
const BY_ID = { 1: PAST, 2: CURRENT, 3: NEXT, 4: ACTIVE_ENDED, 5: ACTIVE_RUNNING, 6: ACTIVE_OPEN };

function json(status, body) {
  return new Response(body === undefined ? null : JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

let fetchMock;
let roles;
let cycles;
let writeResponse;

function route(request) {
  const url = new URL(request.url);
  if (url.pathname.endsWith('/auth/me')) return json(200, { id: 1, firstName: 'A', lastName: 'B', roles });
  if (request.method === 'GET' && url.pathname.endsWith('/cycles')) return json(200, cycles);
  // the detail also loads its stages; they have their own tests (StagesSection.test.jsx)
  if (request.method === 'GET' && url.pathname.endsWith('/stages')) return json(200, []);
  const detail = url.pathname.match(/\/cycles\/(\d+)$/);
  if (request.method === 'GET' && detail) {
    return BY_ID[detail[1]]
      ? json(200, BY_ID[detail[1]])
      : json(404, { status: 404, detail: 'No encontramos el ciclo solicitado.' });
  }
  return writeResponse(request);
}

function renderAt(path) {
  const router = createMemoryRouter(
    [
      { path: '/', element: <p>Inicio</p> },
      {
        element: <AdminRoute />,
        children: [
          { path: '/cycles', element: <CyclesPage /> },
          { path: '/cycles/:id', element: <CycleDetailPage /> },
        ],
      },
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

const writes = () => fetchMock.mock.calls.map(([r]) => r).filter((r) => r.method !== 'GET');

async function openCreateForm() {
  fireEvent.click((await screen.findAllByRole('button', { name: /nuevo ciclo/i }))[0]);
  return screen.findByRole('form', { name: 'Nuevo ciclo' });
}

function fill(form, { name, startDate, endDate }) {
  if (name !== undefined) fireEvent.change(within(form).getByLabelText(/Nombre/), { target: { value: name } });
  if (startDate !== undefined) {
    fireEvent.change(within(form).getByLabelText(/Fecha de inicio/), { target: { value: startDate } });
  }
  if (endDate !== undefined) fireEvent.change(within(form).getByLabelText(/Fecha de fin/), { target: { value: endDate } });
}

describe('Cycle date display', () => {
  it('formats ISO dates as in the prototype, without time zone shifts', () => {
    expect(formatDate('2026-08-04')).toBe('04 ago 2026');
    expect(formatDate('2026-01-31')).toBe('31 ene 2026');
    expect(formatDate(null)).toBeNull();
    expect(cycleDates(CURRENT)).toBe('01 mar 2026 – 31 jul 2026');
    expect(cycleDates(NEXT)).toBe('04 ago 2026 – sin fecha de fin');
  });
});

describe('Cycles screens', () => {
  beforeEach(() => {
    roles = ['ADMIN'];
    cycles = [NEXT, CURRENT, PAST];
    writeResponse = () => json(201, NEXT);
    fetchMock = vi.fn((request) => Promise.resolve(route(request)));
    vi.stubGlobal('fetch', fetchMock);
    document.cookie = 'XSRF-TOKEN=csrf-1';
  });

  afterEach(() => vi.unstubAllGlobals());

  it('lists cycles in the order the backend sends, with dates and status', async () => {
    renderAt('/cycles');

    const next = (await screen.findByRole('button', { name: 'Ver 2026-II' })).closest('li');
    expect(within(next).getByText('04 ago 2026 – sin fecha de fin')).toBeInTheDocument();
    expect(within(next).getByText('Planificado')).toBeInTheDocument();

    const current = screen.getByRole('button', { name: 'Ver 2026-I' }).closest('li');
    expect(within(current).getByText('01 mar 2026 – 31 jul 2026')).toBeInTheDocument();
    expect(within(current).getByText('Activo')).toBeInTheDocument();

    const past = screen.getByRole('button', { name: 'Ver 2025-II' }).closest('li');
    expect(within(past).getByText('Cerrado')).toBeInTheDocument();

    const cards = screen.getAllByRole('button', { name: /^Ver / }).map((card) => card.getAttribute('aria-label'));
    expect(cards).toEqual(['Ver 2026-II', 'Ver 2026-I', 'Ver 2025-II']);
    expect(screen.getByText('3 ciclos · del más reciente al más antiguo')).toBeInTheDocument();
  });

  it('shows an empty state when there are no cycles', async () => {
    cycles = [];
    renderAt('/cycles');

    expect(await screen.findByText('Aún no hay ciclos creados.')).toBeInTheDocument();
  });

  it('sends non-admins back home', async () => {
    roles = ['TUTOR'];
    const router = renderAt('/cycles');

    expect(await screen.findByText('Inicio')).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/');
  });

  it('flags missing name and start date before calling the backend', async () => {
    renderAt('/cycles');
    const form = await openCreateForm();

    fireEvent.click(within(form).getByRole('button', { name: 'Crear ciclo' }));

    expect(await within(form).findByText('El ciclo necesita un nombre.')).toBeInTheDocument();
    expect(within(form).getByText('Ingresa la fecha de inicio del ciclo.')).toBeInTheDocument();
    expect(writes()).toHaveLength(0);
  });

  it('rejects an end date before the start date', async () => {
    renderAt('/cycles');
    const form = await openCreateForm();

    fill(form, { name: '2027-I', startDate: '2027-07-31', endDate: '2027-03-01' });
    fireEvent.click(within(form).getByRole('button', { name: 'Crear ciclo' }));

    expect(
      await within(form).findByText('La fecha de fin no puede ser anterior a la fecha de inicio.'),
    ).toBeInTheDocument();
    expect(writes()).toHaveLength(0);
  });

  it('creates a cycle without end date', async () => {
    renderAt('/cycles');
    const form = await openCreateForm();

    fill(form, { name: '  2027-I ', startDate: '2027-03-01' });
    fireEvent.click(within(form).getByRole('button', { name: 'Crear ciclo' }));

    expect(await screen.findByText('Ciclo creado.')).toBeInTheDocument();
    const [request] = writes();
    expect(request.method).toBe('POST');
    expect(new URL(request.url).pathname).toMatch(/\/cycles$/);
    expect(request.headers.get('X-XSRF-TOKEN')).toBe('csrf-1');
    expect(await request.json()).toEqual({ name: '2027-I', startDate: '2027-03-01', endDate: null });
  });

  it('keeps the form open with the backend message when dates overlap', async () => {
    writeResponse = () =>
      json(409, { status: 409, detail: 'Las fechas de este ciclo se cruzan con las de otro ciclo.' });
    renderAt('/cycles');
    const form = await openCreateForm();

    fill(form, { name: '2026-III', startDate: '2026-07-01', endDate: '2026-09-01' });
    fireEvent.click(within(form).getByRole('button', { name: 'Crear ciclo' }));

    expect(
      await within(form).findByText('Las fechas de este ciclo se cruzan con las de otro ciclo.'),
    ).toBeInTheDocument();
    expect(within(form).getByLabelText(/Nombre/)).toHaveValue('2026-III');
  });

  it('opens a cycle from the list', async () => {
    const router = renderAt('/cycles');

    fireEvent.click(await screen.findByRole('button', { name: 'Ver 2026-I' }));

    expect(await screen.findByRole('heading', { name: '2026-I' })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/cycles/2');
  });

  it('shows the detail and edits name and dates', async () => {
    writeResponse = () => json(200, { ...CURRENT, name: 'Ciclo 2026-I' });
    renderAt('/cycles/2');

    const data = await screen.findByRole('region', { name: 'Datos del ciclo' });
    expect(within(data).getByText('Activo')).toBeInTheDocument();
    expect(within(data).getByText('01 mar 2026')).toBeInTheDocument();
    expect(within(data).getByText('31 jul 2026')).toBeInTheDocument();

    fireEvent.click(within(data).getByRole('button', { name: 'Editar' }));
    const form = await screen.findByRole('form', { name: 'Editar 2026-I' });
    expect(within(form).getByLabelText(/Nombre/)).toHaveValue('2026-I');
    expect(within(form).getByLabelText(/Fecha de inicio/)).toHaveValue('2026-03-01');
    expect(within(form).getByLabelText(/Fecha de fin/)).toHaveValue('2026-07-31');

    fill(form, { name: 'Ciclo 2026-I', endDate: '' });
    fireEvent.click(within(form).getByRole('button', { name: 'Guardar' }));

    expect(await screen.findByText('Ciclo actualizado.')).toBeInTheDocument();
    const [request] = writes();
    expect(request.method).toBe('PUT');
    expect(new URL(request.url).pathname).toMatch(/\/cycles\/2$/);
    expect(await request.json()).toEqual({ name: 'Ciclo 2026-I', startDate: '2026-03-01', endDate: null });
  });

  it('deletes a cycle after confirming and goes back to the list', async () => {
    writeResponse = () => json(204);
    const router = renderAt('/cycles/1'); // a closed one: any status can be deleted

    fireEvent.click(await screen.findByRole('button', { name: 'Eliminar ciclo' }));
    const dialog = await screen.findByRole('dialog', { name: '¿Eliminar ciclo?' });
    expect(within(dialog).getByText(/no podrás recuperarlo/)).toBeInTheDocument();
    expect(within(dialog).getByText(/Solo se puede eliminar un ciclo sin etapas/)).toBeInTheDocument();
    expect(writes()).toHaveLength(0);

    cycles = [NEXT, CURRENT]; // what the backend lists once it is gone
    fireEvent.click(within(dialog).getByRole('button', { name: 'Eliminar' }));

    expect(await screen.findByText('Ciclo eliminado.')).toBeInTheDocument();
    const [request] = writes();
    expect(request.method).toBe('DELETE');
    expect(new URL(request.url).pathname).toMatch(/\/cycles\/1$/);
    expect(request.headers.get('X-XSRF-TOKEN')).toBe('csrf-1');
    await waitFor(() => expect(router.state.location.pathname).toBe('/cycles'));
    expect(await screen.findByRole('button', { name: 'Ver 2026-I' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Ver 2025-II' })).not.toBeInTheDocument();
  });

  it('stays on the cycle and shows why when the backend refuses to delete', async () => {
    const refusal = 'Este ciclo tiene etapas, así que no se puede eliminar. Elimina primero sus etapas.';
    writeResponse = () => json(409, { status: 409, detail: refusal });
    const router = renderAt('/cycles/2');

    fireEvent.click(await screen.findByRole('button', { name: 'Eliminar ciclo' }));
    fireEvent.click(within(await screen.findByRole('dialog')).getByRole('button', { name: 'Eliminar' }));

    expect(await screen.findByText(refusal)).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/cycles/2');
    expect(screen.getByRole('heading', { name: '2026-I' })).toBeInTheDocument();
  });

  it('shows a closed cycle as read-only', async () => {
    renderAt('/cycles/1');

    const data = await screen.findByRole('region', { name: 'Datos del ciclo' });
    expect(within(data).getByText('Cerrado')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Editar' })).not.toBeInTheDocument();
    expect(screen.getByText(/ya no se puede editar/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /activar ciclo|cerrar ciclo/i })).not.toBeInTheDocument();
  });

  it('activates a planned cycle after confirming', async () => {
    writeResponse = () => json(200, { ...NEXT, status: 'ACTIVE' });
    renderAt('/cycles/3');

    fireEvent.click(await screen.findByRole('button', { name: 'Activar ciclo' }));
    expect(screen.queryByRole('button', { name: 'Cerrar ciclo' })).not.toBeInTheDocument();
    const dialog = await screen.findByRole('dialog', { name: '¿Activar ciclo?' });
    expect(within(dialog).getByText(/no se puede deshacer/)).toBeInTheDocument();
    expect(writes()).toHaveLength(0);

    fireEvent.click(within(dialog).getByRole('button', { name: 'Activar' }));

    expect(await screen.findByText('Ciclo activado.')).toBeInTheDocument();
    const [request] = writes();
    expect(request.method).toBe('PATCH');
    expect(new URL(request.url).pathname).toMatch(/\/cycles\/3\/status$/);
    expect(request.headers.get('X-XSRF-TOKEN')).toBe('csrf-1');
    expect(await request.json()).toEqual({ status: 'ACTIVE', confirm: false });
  });

  it('does nothing when the confirmation is cancelled', async () => {
    renderAt('/cycles/3');

    fireEvent.click(await screen.findByRole('button', { name: 'Activar ciclo' }));
    fireEvent.click(within(await screen.findByRole('dialog')).getByRole('button', { name: 'Cancelar' }));

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(writes()).toHaveLength(0);
  });

  it('shows why the backend refuses to activate', async () => {
    writeResponse = () => json(409, { status: 409, detail: 'Ya hay otro ciclo activo. Ciérralo antes de activar este.' });
    renderAt('/cycles/3');

    fireEvent.click(await screen.findByRole('button', { name: 'Activar ciclo' }));
    fireEvent.click(within(await screen.findByRole('dialog')).getByRole('button', { name: 'Activar' }));

    expect(await screen.findByText('Ya hay otro ciclo activo. Ciérralo antes de activar este.')).toBeInTheDocument();
  });

  it('closes a cycle whose end date already passed with a plain confirmation', async () => {
    writeResponse = () => json(200, { ...ACTIVE_ENDED, status: 'CLOSED' });
    renderAt('/cycles/4');

    fireEvent.click(await screen.findByRole('button', { name: 'Cerrar ciclo' }));
    const dialog = await screen.findByRole('dialog', { name: '¿Cerrar ciclo?' });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Cerrar ciclo' }));

    expect(await screen.findByText('Ciclo cerrado.')).toBeInTheDocument();
    expect(await writes()[0].json()).toEqual({ status: 'CLOSED', confirm: false });
  });

  it('warns that closing early moves the end date to today, and confirms it to the backend', async () => {
    writeResponse = () => json(200, { ...ACTIVE_RUNNING, status: 'CLOSED' });
    renderAt('/cycles/5');

    fireEvent.click(await screen.findByRole('button', { name: 'Cerrar ciclo' }));
    const dialog = await screen.findByRole('dialog', { name: '¿Cerrar el ciclo antes de su fecha de fin?' });
    expect(within(dialog).getByText(/termina el 31 dic 2999/)).toBeInTheDocument();
    expect(within(dialog).getByText(/su fecha de fin pasará a ser hoy/)).toBeInTheDocument();
    expect(within(dialog).getByText(/el siguiente ciclo solo podrá empezar después de esa fecha/)).toBeInTheDocument();

    fireEvent.click(within(dialog).getByRole('button', { name: 'Cerrar hoy' }));

    expect(await screen.findByText('Ciclo cerrado.')).toBeInTheDocument();
    expect(await writes()[0].json()).toEqual({ status: 'CLOSED', confirm: true });
  });

  it('asks for the end date first when closing a cycle that has none', async () => {
    renderAt('/cycles/6');

    fireEvent.click(await screen.findByRole('button', { name: 'Cerrar ciclo' }));
    const dialog = await screen.findByRole('dialog', { name: 'Falta la fecha de fin' });
    expect(within(dialog).getByText(/Elígela con cuidado/)).toBeInTheDocument();
    expect(within(dialog).getByText(/el siguiente ciclo solo podrá empezar después de esa fecha/)).toBeInTheDocument();

    fireEvent.click(within(dialog).getByRole('button', { name: 'Definir fecha de fin' }));

    expect(await screen.findByRole('form', { name: 'Editar Sin fin' })).toBeInTheDocument();
    expect(writes()).toHaveLength(0);
  });

  it('asks again when the backend says closing needs confirmation', async () => {
    writeResponse = () => json(409, { status: 409, detail: 'Vas a cerrar el ciclo antes…', requiresConfirmation: true });
    renderAt('/cycles/4');

    fireEvent.click(await screen.findByRole('button', { name: 'Cerrar ciclo' }));
    fireEvent.click(within(await screen.findByRole('dialog', { name: '¿Cerrar ciclo?' })).getByRole('button', { name: 'Cerrar ciclo' }));

    expect(await screen.findByRole('dialog', { name: '¿Cerrar el ciclo antes de su fecha de fin?' })).toBeInTheDocument();
  });

  it('shows the backend message for an unknown cycle', async () => {
    renderAt('/cycles/999');

    expect(await screen.findByText('No encontramos el ciclo solicitado.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '‹ Ciclos' })).toBeInTheDocument();
  });
});
