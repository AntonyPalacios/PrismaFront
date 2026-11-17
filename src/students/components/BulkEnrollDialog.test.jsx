import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ThemeProvider } from '@mui/material/styles';
import { NotificationProvider } from '../../app/notifications';
import { makeStore } from '../../app/store';
import { theme } from '../../app/theme';
import CycleDetailPage from '../../academic/pages/CycleDetailPage';

// every person is invented
const ACTIVE_CYCLE = { id: 2, name: '2026-II', startDate: '2026-08-04', endDate: '2026-12-19', status: 'ACTIVE' };
const CLOSED_CYCLE = { id: 1, name: '2025-II', startDate: '2025-08-01', endDate: '2025-12-15', status: 'CLOSED' };
const CYCLES = { 1: CLOSED_CYCLE, 2: ACTIVE_CYCLE };
const STAGES = {
  1: [{ id: 5, cycleId: 1, name: 'Final', startDate: '2025-08-01', endDate: '2025-12-15', status: 'CLOSED', current: false }],
  2: [
    { id: 10, cycleId: 2, name: 'Nivelación', startDate: '2026-08-04', endDate: '2026-09-27', status: 'CLOSED', current: false },
    { id: 11, cycleId: 2, name: 'Reforzamiento', startDate: '2026-09-28', endDate: '2026-11-15', status: 'ACTIVE', current: true },
    { id: 12, cycleId: 2, name: 'Simulacros', startDate: '2026-11-16', endDate: null, status: 'PLANNED', current: false },
  ],
};
const CAREERS = [
  { id: 1, name: 'Letras', active: true },
  { id: 2, name: 'Ciencias', active: true },
  { id: 3, name: 'Antigua', active: false },
];
const USERS = [
  { id: 1, firstName: 'Antony', lastNamePat: 'Palacios', lastNameMat: 'Coronado', roles: ['ADMIN'], active: true },
  { id: 51, firstName: 'Ruth', lastNamePat: 'Salas', lastNameMat: null, roles: ['TUTOR'], active: true },
  { id: 50, firstName: 'Silvia', lastNamePat: 'Valle', lastNameMat: 'Gómez', roles: ['TUTOR'], active: true },
];
const PREVIEW = [
  { studentId: 100, fullName: 'Pinto, Beto', careerId: null, tutorUserId: null, skipReason: null },
  { studentId: 101, fullName: 'Quiroz, Carla', careerId: 2, tutorUserId: null, skipReason: 'ALREADY_ENROLLED' },
  { studentId: 102, fullName: 'Ramos, Ana', careerId: 1, tutorUserId: 50, skipReason: null },
  { studentId: 103, fullName: 'Torres, Dario', careerId: null, tutorUserId: null, skipReason: 'INACTIVE_STUDENT' },
];

function json(status, body) {
  return new Response(body === undefined ? null : JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

let fetchMock;
let bulkResponse;

function route(request) {
  const url = new URL(request.url);
  const path = url.pathname;
  const cycle = path.match(/\/cycles\/(\d+)$/);
  const stages = path.match(/\/cycles\/(\d+)\/stages$/);
  if (cycle) return json(200, CYCLES[cycle[1]]);
  if (stages) return json(200, STAGES[stages[1]]);
  if (path.endsWith('/cycles')) return json(200, [ACTIVE_CYCLE, CLOSED_CYCLE]);
  if (path.endsWith('/careers')) return json(200, CAREERS);
  if (path.endsWith('/users')) return json(200, USERS);
  if (path.endsWith('/enrollments/bulk-preview')) return json(200, PREVIEW);
  if (path.endsWith('/enrollments/bulk')) return bulkResponse();
  return json(404, { detail: 'No encontrado' });
}

function renderCycle(id) {
  const router = createMemoryRouter([{ path: '/cycles/:id', element: <CycleDetailPage /> }], {
    initialEntries: [`/cycles/${id}`],
  });
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

const callsTo = (suffix) => fetchMock.mock.calls.map(([r]) => r).filter((r) => new URL(r.url).pathname.endsWith(suffix));

async function openBulk(stageName) {
  renderCycle(2);
  fireEvent.click(await screen.findByRole('button', { name: `Matricular en lote: ${stageName}` }));
  return screen.findByRole('dialog', { name: 'Matricular en lote' });
}

describe('Bulk enrollment', () => {
  beforeEach(() => {
    bulkResponse = () => json(200, { created: 2, skipped: 0 });
    fetchMock = vi.fn((request) => Promise.resolve(route(request)));
    vi.stubGlobal('fetch', fetchMock);
    document.cookie = 'XSRF-TOKEN=csrf-1';
  });

  it('only stages that can still be edited offer it', async () => {
    renderCycle(2);
    expect(await screen.findByRole('button', { name: 'Matricular en lote: Simulacros' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Matricular en lote: Reforzamiento' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Matricular en lote: Nivelación' })).not.toBeInTheDocument();
  });

  it('moves the previous stage with career and tutor preloaded and editable', async () => {
    const dialog = await openBulk('Simulacros');
    expect(within(dialog).getByText('Destino: Ciclo 2026-II · Simulacros')).toBeInTheDocument();

    // the stage that started right before the target is the source
    const table = await within(dialog).findByRole('table', { name: 'Alumnos de la etapa de origen' });
    expect(within(dialog).getByLabelText('Etapa de origen')).toHaveValue('11');
    const preview = await callsTo('/bulk-preview')[0].clone().json();
    expect(preview).toEqual({ sourceStageId: 11, targetStageId: 12 });

    // skipped students can't be picked; the rest start checked
    expect(within(table).getByRole('checkbox', { name: 'Elegir a Pinto, Beto' })).toBeChecked();
    expect(within(table).getByRole('checkbox', { name: 'Elegir a Quiroz, Carla' })).toBeDisabled();
    expect(within(table).getByText('Ya matriculado: se omitirá')).toBeInTheDocument();
    expect(within(table).getByText('Dado de baja: se omitirá')).toBeInTheDocument();

    fireEvent.click(within(dialog).getByRole('button', { name: 'Siguiente' }));
    await within(dialog).findByRole('table', { name: 'Carrera y tutor por alumno' });
    expect(within(dialog).getByLabelText('Carrera de Ramos, Ana')).toHaveValue('1');
    expect(within(dialog).getByLabelText('Tutor de Ramos, Ana')).toHaveValue('50');
    expect(within(dialog).getByLabelText('Carrera de Pinto, Beto')).toHaveValue('');
    // an inactive career is never offered
    expect(within(within(dialog).getByLabelText('Carrera de Pinto, Beto')).queryByText('Antigua')).not.toBeInTheDocument();

    fireEvent.change(within(dialog).getByLabelText('Carrera de Pinto, Beto'), { target: { value: '2' } });
    // one tutor for every empty one: Ana keeps hers
    fireEvent.change(within(dialog).getByLabelText('Aplicar un tutor a todos los vacíos'), { target: { value: '51' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Aplicar' }));
    expect(within(dialog).getByLabelText('Tutor de Pinto, Beto')).toHaveValue('51');
    expect(within(dialog).getByLabelText('Tutor de Ramos, Ana')).toHaveValue('50');

    fireEvent.click(within(dialog).getByRole('button', { name: 'Confirmar 2 matrículas' }));
    expect(await within(dialog).findByText('2 alumnos matriculados en Simulacros.')).toBeInTheDocument();
    const sent = await callsTo('/enrollments/bulk')[0].clone().json();
    expect(sent).toEqual({
      targetStageId: 12,
      rows: [
        { studentId: 100, careerId: 2, tutorUserId: 51 },
        { studentId: 102, careerId: 1, tutorUserId: 50 },
      ],
    });
  });

  it('keeps the edits when the backend rejects the batch', async () => {
    bulkResponse = () => json(409, { detail: 'El usuario elegido no es un tutor activo.' });
    const dialog = await openBulk('Simulacros');
    const table = await within(dialog).findByRole('table', { name: 'Alumnos de la etapa de origen' });
    fireEvent.click(within(table).getByRole('checkbox', { name: 'Elegir a Ramos, Ana' }));
    fireEvent.click(within(dialog).getByRole('button', { name: 'Siguiente' }));
    fireEvent.change(await within(dialog).findByLabelText('Carrera de Pinto, Beto'), { target: { value: '1' } });

    fireEvent.click(within(dialog).getByRole('button', { name: 'Confirmar 1 matrícula' }));
    expect(await within(dialog).findByText('El usuario elegido no es un tutor activo.')).toBeInTheDocument();
    expect(within(dialog).getByLabelText('Carrera de Pinto, Beto')).toHaveValue('1');
    expect(within(dialog).queryByLabelText('Carrera de Ramos, Ana')).not.toBeInTheDocument();
  });

  it('can take the group from another cycle, and needs someone to move', async () => {
    const dialog = await openBulk('Simulacros');
    await within(dialog).findByRole('table', { name: 'Alumnos de la etapa de origen' });
    fireEvent.change(within(dialog).getByLabelText('Ciclo de origen'), { target: { value: '1' } });
    // in another cycle, its last stage
    await waitFor(() => expect(within(dialog).getByLabelText('Etapa de origen')).toHaveValue('5'));
    await waitFor(() => expect(callsTo('/bulk-preview')).toHaveLength(2));
    expect(await callsTo('/bulk-preview')[1].clone().json()).toEqual({ sourceStageId: 5, targetStageId: 12 });

    fireEvent.click(await within(dialog).findByRole('checkbox', { name: 'Elegir a todos' }));
    expect(within(dialog).getByRole('button', { name: 'Siguiente' })).toBeDisabled();
  });
});
