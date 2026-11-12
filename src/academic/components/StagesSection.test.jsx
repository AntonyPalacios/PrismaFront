import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ThemeProvider } from '@mui/material/styles';
import { NotificationProvider } from '../../app/notifications';
import { makeStore } from '../../app/store';
import { theme } from '../../app/theme';
import { formatShortDate, stageDates } from '../cycleDisplay';
import CycleDetailPage from '../pages/CycleDetailPage';

const ACTIVE_CYCLE = { id: 2, name: '2026-II', startDate: '2026-08-04', endDate: '2026-12-19', status: 'ACTIVE' };
const CLOSED_CYCLE = { id: 1, name: '2025-II', startDate: '2025-08-01', endDate: '2025-12-15', status: 'CLOSED' };
const CYCLES = { 1: CLOSED_CYCLE, 2: ACTIVE_CYCLE };

const FIRST = { id: 10, cycleId: 2, name: 'Nivelación', startDate: '2026-08-04', endDate: '2026-09-27', status: 'CLOSED', current: false };
const SECOND = { id: 11, cycleId: 2, name: 'Reforzamiento', startDate: '2026-09-28', endDate: '2026-11-15', status: 'ACTIVE', current: true };
const THIRD = { id: 12, cycleId: 2, name: 'Simulacros', startDate: '2026-11-16', endDate: null, status: 'PLANNED', current: false };

function json(status, body) {
  return new Response(body === undefined ? null : JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

let fetchMock;
let stages;
let writeResponse;

function route(request) {
  const url = new URL(request.url);
  const cycle = url.pathname.match(/\/cycles\/(\d+)$/);
  if (request.method === 'GET' && cycle) return json(200, CYCLES[cycle[1]]);
  if (request.method === 'GET' && url.pathname.endsWith('/stages')) return json(200, stages);
  return writeResponse(request);
}

function renderCycle(id) {
  const router = createMemoryRouter(
    [
      { path: '/cycles', element: <p>Lista de ciclos</p> },
      { path: '/cycles/:id', element: <CycleDetailPage /> },
    ],
    { initialEntries: [`/cycles/${id}`] },
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
}

const writes = () => fetchMock.mock.calls.map(([r]) => r).filter((r) => r.method !== 'GET');
const section = () => screen.findByRole('region', { name: 'Etapas' });

async function openCreateForm() {
  fireEvent.click(within(await section()).getAllByRole('button', { name: /nueva etapa/i })[0]);
  return screen.findByRole('form', { name: 'Nueva etapa' });
}

function fill(form, { name, startDate, endDate }) {
  if (name !== undefined) fireEvent.change(within(form).getByLabelText(/Nombre/), { target: { value: name } });
  if (startDate !== undefined) {
    fireEvent.change(within(form).getByLabelText(/Fecha de inicio/), { target: { value: startDate } });
  }
  if (endDate !== undefined) fireEvent.change(within(form).getByLabelText(/Fecha de fin/), { target: { value: endDate } });
}

describe('Stage date display', () => {
  it('drops the year, as in the prototype', () => {
    expect(formatShortDate('2026-08-04')).toBe('04 ago');
    expect(stageDates(FIRST)).toBe('04 ago – 27 sep');
    expect(stageDates(THIRD)).toBe('16 nov – sin fin');
  });
});

describe('Stages section', () => {
  beforeEach(() => {
    stages = [FIRST, SECOND, THIRD];
    writeResponse = () => json(201, THIRD);
    fetchMock = vi.fn((request) => Promise.resolve(route(request)));
    vi.stubGlobal('fetch', fetchMock);
    document.cookie = 'XSRF-TOKEN=csrf-1';
  });

  afterEach(() => vi.unstubAllGlobals());

  it('lists the stages in the backend order with dates, status and the one in force', async () => {
    renderCycle(2);

    const items = within(await section()).getAllByRole('listitem');
    expect(items).toHaveLength(3);

    expect(within(items[0]).getByText('Nivelación')).toBeInTheDocument();
    expect(within(items[0]).getByText('04 ago – 27 sep')).toBeInTheDocument();
    expect(within(items[0]).getByText('Cerrada')).toBeInTheDocument();
    expect(within(items[0]).queryByText('Vigente')).not.toBeInTheDocument();

    expect(within(items[1]).getByText('Reforzamiento')).toBeInTheDocument();
    expect(within(items[1]).getByText('Activa')).toBeInTheDocument();
    expect(within(items[1]).getByText('Vigente')).toBeInTheDocument();

    expect(within(items[2]).getByText('16 nov – sin fin')).toBeInTheDocument();
    expect(within(items[2]).getByText('Planificada')).toBeInTheDocument();
  });

  it('shows an empty state when the cycle has no stages', async () => {
    stages = [];
    renderCycle(2);

    expect(await within(await section()).findByText('Este ciclo aún no tiene etapas.')).toBeInTheDocument();
  });

  it('flags missing name and start date before calling the backend', async () => {
    renderCycle(2);
    const form = await openCreateForm();
    expect(within(form).getByText(/dentro del ciclo 2026-II \(04 ago 2026 – 19 dic 2026\)/)).toBeInTheDocument();

    fireEvent.click(within(form).getByRole('button', { name: 'Crear etapa' }));

    expect(await within(form).findByText('La etapa necesita un nombre.')).toBeInTheDocument();
    expect(within(form).getByText('Ingresa la fecha de inicio de la etapa.')).toBeInTheDocument();
    expect(writes()).toHaveLength(0);
  });

  it('creates a stage without end date in its cycle', async () => {
    renderCycle(2);
    const form = await openCreateForm();

    fill(form, { name: ' Repaso final ', startDate: '2026-12-01' });
    fireEvent.click(within(form).getByRole('button', { name: 'Crear etapa' }));

    expect(await screen.findByText('Etapa creada.')).toBeInTheDocument();
    const [request] = writes();
    expect(request.method).toBe('POST');
    expect(new URL(request.url).pathname).toMatch(/\/cycles\/2\/stages$/);
    expect(request.headers.get('X-XSRF-TOKEN')).toBe('csrf-1');
    expect(await request.json()).toEqual({ name: 'Repaso final', startDate: '2026-12-01', endDate: null });
  });

  it('keeps the form open with the backend message when the dates fall outside the cycle', async () => {
    const outside = 'Las fechas de la etapa deben estar dentro de las fechas de su ciclo: no puede empezar antes ni terminar después que el ciclo.';
    writeResponse = () => json(409, { status: 409, detail: outside });
    renderCycle(2);
    const form = await openCreateForm();

    fill(form, { name: 'Fuera', startDate: '2027-01-10' });
    fireEvent.click(within(form).getByRole('button', { name: 'Crear etapa' }));

    expect(await within(form).findByText(outside)).toBeInTheDocument();
    expect(within(form).getByLabelText(/Nombre/)).toHaveValue('Fuera');
  });

  it('edits a stage from its card', async () => {
    writeResponse = () => json(200, { ...THIRD, endDate: '2026-12-19' });
    renderCycle(2);

    fireEvent.click(await screen.findByRole('button', { name: 'Editar Simulacros' }));
    const form = await screen.findByRole('form', { name: 'Editar Simulacros' });
    expect(within(form).getByLabelText(/Fecha de inicio/)).toHaveValue('2026-11-16');

    fill(form, { endDate: '2026-12-19' });
    fireEvent.click(within(form).getByRole('button', { name: 'Guardar' }));

    expect(await screen.findByText('Etapa actualizada.')).toBeInTheDocument();
    const [request] = writes();
    expect(request.method).toBe('PUT');
    expect(new URL(request.url).pathname).toMatch(/\/cycles\/2\/stages\/12$/);
    expect(await request.json()).toEqual({ name: 'Simulacros', startDate: '2026-11-16', endDate: '2026-12-19' });
  });

  it('deletes a stage from its form after confirming', async () => {
    writeResponse = () => json(204);
    renderCycle(2);

    fireEvent.click(await screen.findByRole('button', { name: 'Editar Simulacros' }));
    const form = await screen.findByRole('form', { name: 'Editar Simulacros' });
    fireEvent.click(within(form).getByRole('button', { name: 'Eliminar etapa' }));

    const dialog = await screen.findByRole('dialog', { name: '¿Eliminar etapa?' });
    expect(within(dialog).getByText(/no podrás recuperarla/)).toBeInTheDocument();
    expect(within(dialog).getByText(/sin alumnos matriculados ni exámenes/)).toBeInTheDocument();
    expect(writes()).toHaveLength(0);

    stages = [FIRST, SECOND];
    fireEvent.click(within(dialog).getByRole('button', { name: 'Eliminar' }));

    expect(await screen.findByText('Etapa eliminada.')).toBeInTheDocument();
    const [request] = writes();
    expect(request.method).toBe('DELETE');
    expect(new URL(request.url).pathname).toMatch(/\/cycles\/2\/stages\/12$/);
    await waitFor(() => expect(screen.queryByText('Simulacros')).not.toBeInTheDocument());
  });

  it('shows why the backend refuses to delete a stage with data', async () => {
    const hasData = 'Esta etapa tiene alumnos matriculados o exámenes, así que no se puede eliminar.';
    writeResponse = () => json(409, { status: 409, detail: hasData });
    renderCycle(2);

    // a closed stage is not editable: its card only offers to delete it
    expect(screen.queryByRole('button', { name: 'Editar Nivelación' })).not.toBeInTheDocument();
    fireEvent.click(await screen.findByRole('button', { name: 'Eliminar Nivelación' }));
    fireEvent.click(within(await screen.findByRole('dialog')).getByRole('button', { name: 'Eliminar' }));

    expect(await screen.findByText(hasData)).toBeInTheDocument();
    expect(within(await section()).getByText('Nivelación')).toBeInTheDocument();
  });

  it('offers to activate planned stages and to close the active one, never a closed one', async () => {
    renderCycle(2);

    const items = within(await section()).getAllByRole('listitem');
    expect(within(items[0]).queryByRole('button', { name: /Activar etapa|Cerrar etapa/ })).not.toBeInTheDocument();
    expect(within(items[1]).getByRole('button', { name: 'Cerrar etapa: Reforzamiento' })).toBeInTheDocument();
    expect(within(items[2]).getByRole('button', { name: 'Activar etapa: Simulacros' })).toBeInTheDocument();
  });

  it('activates a planned stage after confirming', async () => {
    writeResponse = () => json(200, { ...THIRD, status: 'ACTIVE' });
    renderCycle(2);

    fireEvent.click(await screen.findByRole('button', { name: 'Activar etapa: Simulacros' }));
    const dialog = await screen.findByRole('dialog', { name: '¿Activar etapa?' });
    expect(within(dialog).getByText(/no se puede deshacer/)).toBeInTheDocument();
    expect(writes()).toHaveLength(0);

    fireEvent.click(within(dialog).getByRole('button', { name: 'Activar' }));

    expect(await screen.findByText('Etapa activada.')).toBeInTheDocument();
    const [request] = writes();
    expect(request.method).toBe('PATCH');
    expect(new URL(request.url).pathname).toMatch(/\/cycles\/2\/stages\/12\/status$/);
    expect(request.headers.get('X-XSRF-TOKEN')).toBe('csrf-1');
    expect(await request.json()).toEqual({ status: 'ACTIVE' });
  });

  it('shows why the backend refuses to activate a stage', async () => {
    const refusal = 'Ya hay otra etapa activa en este ciclo. Ciérrala antes de activar esta.';
    writeResponse = () => json(409, { status: 409, detail: refusal });
    renderCycle(2);

    fireEvent.click(await screen.findByRole('button', { name: 'Activar etapa: Simulacros' }));
    fireEvent.click(within(await screen.findByRole('dialog')).getByRole('button', { name: 'Activar' }));

    expect(await screen.findByText(refusal)).toBeInTheDocument();
  });

  it('closes an active stage whose end date already arrived after confirming', async () => {
    const ended = { ...SECOND, endDate: '2020-12-31' };
    stages = [FIRST, ended, THIRD];
    writeResponse = () => json(200, { ...ended, status: 'CLOSED' });
    renderCycle(2);

    fireEvent.click(await screen.findByRole('button', { name: 'Cerrar etapa: Reforzamiento' }));
    const dialog = await screen.findByRole('dialog', { name: '¿Cerrar etapa?' });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Cerrar etapa' }));

    expect(await screen.findByText('Etapa cerrada.')).toBeInTheDocument();
    const [request] = writes();
    expect(new URL(request.url).pathname).toMatch(/\/cycles\/2\/stages\/11\/status$/);
    expect(await request.json()).toEqual({ status: 'CLOSED' });
  });

  it('sends the admin to correct the end date instead of closing a stage early', async () => {
    stages = [FIRST, { ...SECOND, endDate: '2999-12-31' }, THIRD];
    renderCycle(2);

    fireEvent.click(await screen.findByRole('button', { name: 'Cerrar etapa: Reforzamiento' }));
    const dialog = await screen.findByRole('dialog', { name: 'La fecha de fin todavía no llega' });
    expect(within(dialog).getByText(/termina el 31 dic/)).toBeInTheDocument();
    expect(within(dialog).getByText(/el sistema no la cambia por ti/)).toBeInTheDocument();

    fireEvent.click(within(dialog).getByRole('button', { name: 'Corregir fecha de fin' }));

    expect(await screen.findByRole('form', { name: 'Editar Reforzamiento' })).toBeInTheDocument();
    expect(writes()).toHaveLength(0);
  });

  it('asks for the end date first when closing a stage that has none', async () => {
    stages = [FIRST, { ...SECOND, endDate: null }, THIRD];
    renderCycle(2);

    fireEvent.click(await screen.findByRole('button', { name: 'Cerrar etapa: Reforzamiento' }));
    const dialog = await screen.findByRole('dialog', { name: 'Falta la fecha de fin' });

    fireEvent.click(within(dialog).getByRole('button', { name: 'Definir fecha de fin' }));

    expect(await screen.findByRole('form', { name: 'Editar Reforzamiento' })).toBeInTheDocument();
    expect(writes()).toHaveLength(0);
  });

  it('in a closed cycle only offers to delete stages', async () => {
    stages = [{ ...FIRST, cycleId: 1 }, { ...THIRD, cycleId: 1 }];
    renderCycle(1);

    const stagesSection = await section();
    expect(await within(stagesSection).findByRole('button', { name: 'Eliminar Nivelación' })).toBeInTheDocument();
    expect(within(stagesSection).getByRole('button', { name: 'Eliminar Simulacros' })).toBeInTheDocument();
    expect(within(stagesSection).queryByRole('button', { name: /nueva etapa/i })).not.toBeInTheDocument();
    expect(within(stagesSection).queryByRole('button', { name: /^Editar / })).not.toBeInTheDocument();
    expect(within(stagesSection).queryByRole('button', { name: /Activar etapa|Cerrar etapa/ })).not.toBeInTheDocument();
  });
});
