import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ThemeProvider } from '@mui/material/styles';
import { NotificationProvider } from '../../app/notifications';
import { makeStore } from '../../app/store';
import { theme } from '../../app/theme';
import ExamsPage from './ExamsPage';

const CYCLES = [
  { id: 2, name: '2026-II', status: 'PLANNED', startDate: '2026-07-01', endDate: '2026-12-31' },
  { id: 1, name: '2026-I', status: 'ACTIVE', startDate: '2026-01-01', endDate: '2026-06-30' },
];
const STAGES = {
  1: [
    { id: 10, cycleId: 1, name: 'Nivelación', startDate: '2026-01-01', endDate: '2026-02-28', status: 'CLOSED', current: false },
    { id: 11, cycleId: 1, name: 'Regular', startDate: '2026-03-01', endDate: '2026-06-30', status: 'ACTIVE', current: true },
  ],
  2: [{ id: 20, cycleId: 2, name: 'Nivelación', startDate: '2026-07-01', endDate: '2026-08-31', status: 'PLANNED', current: false }],
};
const TYPES = [
  { id: 1, name: 'Ciencias' },
  { id: 2, name: 'Letras' },
  { id: 3, name: 'Arquitectura' },
];
const REGULAR_1_CIENCIAS = { id: 100, stageId: 11, name: 'Regular 1', examDate: '2026-03-14', examTypeId: 1, examTypeName: 'Ciencias', hasResults: true };
const REGULAR_1_LETRAS = { id: 101, stageId: 11, name: 'Regular 1', examDate: '2026-03-14', examTypeId: 2, examTypeName: 'Letras', hasResults: false };
const EXAMS = { 11: [REGULAR_1_CIENCIAS, REGULAR_1_LETRAS], 10: [], 20: [] };

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
  if (request.method === 'GET' && url.pathname.endsWith('/cycles')) return json(200, CYCLES);
  const stagesOf = url.pathname.match(/\/cycles\/(\d+)\/stages$/);
  if (request.method === 'GET' && stagesOf) return json(200, STAGES[stagesOf[1]] ?? []);
  if (request.method === 'GET' && url.pathname.endsWith('/exam-types')) return json(200, TYPES);
  if (request.method === 'GET' && url.pathname.endsWith('/exams')) return json(200, EXAMS[url.searchParams.get('stageId')] ?? []);
  return writeResponse(request);
}

function renderPage() {
  const router = createMemoryRouter([{ path: '/exams', element: <ExamsPage /> }], { initialEntries: ['/exams'] });
  render(
    <Provider store={makeStore()}>
      <ThemeProvider theme={theme}>
        <NotificationProvider>
          <RouterProvider router={router} />
        </NotificationProvider>
      </ThemeProvider>
    </Provider>,
  );
}

const requests = () => fetchMock.mock.calls.map(([r]) => r);
const writes = () => requests().filter((r) => r.method !== 'GET');
const examCard = (name) => screen.findByRole('button', { name: `Examen ${name}` });

describe('Exams screen', () => {
  beforeEach(() => {
    roles = ['ADMIN'];
    writeResponse = () => json(201, []);
    fetchMock = vi.fn((request) => Promise.resolve(route(request)));
    vi.stubGlobal('fetch', fetchMock);
    document.cookie = 'XSRF-TOKEN=csrf-1';
  });

  afterEach(() => vi.unstubAllGlobals());

  it('starts on the stage in force of the active cycle and lists its exams', async () => {
    renderPage();

    expect(await examCard('Regular 1 · Ciencias')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Examen Regular 1 · Letras' })).toBeInTheDocument();
    expect(screen.getByLabelText('Ciclo')).toHaveValue('1');
    expect(screen.getByLabelText('Etapa')).toHaveValue('11');
    expect(within(screen.getByLabelText('Etapa')).getByRole('option', { name: 'Regular (vigente)' })).toBeInTheDocument();
    const table = screen.getByRole('table', { name: 'Exámenes' });
    expect(within(table).getAllByText('14 mar 2026')).toHaveLength(2);
    expect(within(table).getByText('Cargados')).toBeInTheDocument();
    expect(within(table).getByText('Pendientes')).toBeInTheDocument();
  });

  it('changing the cycle shows its stages and their exams', async () => {
    renderPage();
    await examCard('Regular 1 · Ciencias');

    fireEvent.change(screen.getByLabelText('Ciclo'), { target: { value: '2' } });

    await waitFor(() => expect(screen.getByLabelText('Etapa')).toHaveValue('20'));
    expect(await screen.findByText('Aún no hay exámenes en esta etapa.')).toBeInTheDocument();
  });

  it('creates a mock exam for every checked type in one request', async () => {
    writeResponse = () => json(201, [{ id: 1 }, { id: 2 }]);
    renderPage();
    await examCard('Regular 1 · Ciencias');
    fireEvent.click(screen.getAllByRole('button', { name: /nuevo examen/i })[0]);
    const form = await screen.findByRole('form', { name: 'Nuevo examen' });

    // every type comes checked
    await waitFor(() => expect(within(form).getByRole('checkbox', { name: 'Arquitectura' })).toBeChecked());
    fireEvent.click(within(form).getByRole('checkbox', { name: 'Arquitectura' }));
    fireEvent.change(within(form).getByLabelText(/Nombre/), { target: { value: ' Regular 2 ' } });
    fireEvent.change(within(form).getByLabelText(/Fecha/), { target: { value: '2026-03-21' } });
    fireEvent.click(within(form).getByRole('button', { name: 'Crear' }));

    expect(await screen.findByText('2 exámenes creados.')).toBeInTheDocument();
    const [request] = writes();
    expect(request.method).toBe('POST');
    expect(new URL(request.url).pathname).toMatch(/\/exams$/);
    expect(request.headers.get('X-XSRF-TOKEN')).toBe('csrf-1');
    expect(await request.json()).toEqual({ stageId: 11, name: 'Regular 2', examDate: '2026-03-21', examTypeIds: [1, 2] });
  });

  it('flags missing data and no type before calling the backend', async () => {
    renderPage();
    await examCard('Regular 1 · Ciencias');
    fireEvent.click(screen.getAllByRole('button', { name: /nuevo examen/i })[0]);
    const form = await screen.findByRole('form', { name: 'Nuevo examen' });
    await waitFor(() => expect(within(form).getByRole('checkbox', { name: 'Ciencias' })).toBeChecked());

    ['Ciencias', 'Letras', 'Arquitectura'].forEach((name) => fireEvent.click(within(form).getByRole('checkbox', { name })));
    fireEvent.click(within(form).getByRole('button', { name: 'Crear' }));

    expect(await within(form).findByText('El examen necesita un nombre.')).toBeInTheDocument();
    expect(within(form).getByText('Ingresa la fecha del examen.')).toBeInTheDocument();
    expect(within(form).getByText('Elige al menos un tipo de examen.')).toBeInTheDocument();
    expect(writes()).toHaveLength(0);
  });

  it('keeps the form open with the backend message', async () => {
    writeResponse = () => json(409, { status: 409, detail: 'Ya existe un examen de Ciencias con ese nombre en esta etapa.' });
    renderPage();
    await examCard('Regular 1 · Ciencias');
    fireEvent.click(screen.getAllByRole('button', { name: /nuevo examen/i })[0]);
    const form = await screen.findByRole('form', { name: 'Nuevo examen' });
    await waitFor(() => expect(within(form).getByRole('checkbox', { name: 'Ciencias' })).toBeChecked());

    fireEvent.change(within(form).getByLabelText(/Nombre/), { target: { value: 'Regular 1' } });
    fireEvent.change(within(form).getByLabelText(/Fecha/), { target: { value: '2026-03-14' } });
    fireEvent.click(within(form).getByRole('button', { name: 'Crear' }));

    expect(await within(form).findByText('Ya existe un examen de Ciencias con ese nombre en esta etapa.')).toBeInTheDocument();
  });

  it('edits an exam without results and deletes it after confirming', async () => {
    writeResponse = (request) => (request.method === 'DELETE' ? json(204) : json(200, REGULAR_1_LETRAS));
    renderPage();
    fireEvent.click(await examCard('Regular 1 · Letras'));
    const form = await screen.findByRole('form', { name: 'Regular 1 · Letras' });

    const save = within(form).getByRole('button', { name: 'Guardar' });
    expect(save).toBeDisabled();
    fireEvent.change(within(form).getByLabelText(/Nombre/), { target: { value: 'Regular 2' } });
    await waitFor(() => expect(save).toBeEnabled());
    fireEvent.click(save);

    expect(await screen.findByText('Examen actualizado.')).toBeInTheDocument();
    const [put] = writes();
    expect(put.method).toBe('PUT');
    expect(new URL(put.url).pathname).toMatch(/\/exams\/101$/);
    expect(await put.json()).toEqual({ name: 'Regular 2', examDate: '2026-03-14', examTypeId: 2 });

    fireEvent.click(await examCard('Regular 1 · Letras'));
    const again = await screen.findByRole('form', { name: 'Regular 1 · Letras' });
    fireEvent.click(within(again).getByRole('button', { name: 'Eliminar' }));
    const dialog = await screen.findByRole('dialog', { name: '¿Eliminar examen?' });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Eliminar' }));

    expect(await screen.findByText('Examen eliminado.')).toBeInTheDocument();
    expect(writes()[1].method).toBe('DELETE');
  });

  it('an exam with results keeps its type and cannot be deleted', async () => {
    renderPage();
    fireEvent.click(await examCard('Regular 1 · Ciencias'));
    const form = await screen.findByRole('form', { name: 'Regular 1 · Ciencias' });

    expect(within(form).getByLabelText('Tipo de examen')).toBeDisabled();
    expect(within(form).getByText('Ya tiene resultados: su tipo no se puede cambiar.')).toBeInTheDocument();
    expect(within(form).queryByRole('button', { name: 'Eliminar' })).not.toBeInTheDocument();
    expect(within(form).getByLabelText(/Nombre/)).toBeEnabled();
  });

  it('a tutor reads the exams without creating or editing them', async () => {
    roles = ['TUTOR'];
    renderPage();
    fireEvent.click(await examCard('Regular 1 · Letras'));
    const form = await screen.findByRole('form', { name: 'Regular 1 · Letras' });

    expect(screen.queryByRole('button', { name: /nuevo examen/i })).not.toBeInTheDocument();
    expect(within(form).getByLabelText(/Nombre/)).toBeDisabled();
    expect(within(form).queryByRole('button', { name: 'Guardar' })).not.toBeInTheDocument();
    expect(within(form).queryByRole('button', { name: 'Eliminar' })).not.toBeInTheDocument();
    expect(within(form).getByText('Solo el administrador y el coordinador editan los exámenes.')).toBeInTheDocument();
  });

  it('a coordinator manages exams too', async () => {
    roles = ['COORDINADOR'];
    renderPage();
    await examCard('Regular 1 · Ciencias');

    expect(screen.getAllByRole('button', { name: /nuevo examen/i }).length).toBeGreaterThan(0);
  });
});
