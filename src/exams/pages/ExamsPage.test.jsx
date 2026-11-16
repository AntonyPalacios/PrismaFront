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
// newest first, as the backend sends them
const REGULAR_1 = {
  id: 100,
  stageId: 11,
  name: 'Regular 1',
  examDate: '2026-03-14',
  hasResults: true,
  exams: [
    { id: 1001, examTypeId: 1, examTypeName: 'Ciencias', hasResults: true },
    { id: 1002, examTypeId: 2, examTypeName: 'Letras', hasResults: false },
  ],
};
const MEDICION = {
  id: 99,
  stageId: 11,
  name: 'Medición',
  examDate: '2026-03-02',
  hasResults: false,
  exams: [{ id: 990, examTypeId: 1, examTypeName: 'Ciencias', hasResults: false }],
};

function json(status, body) {
  return new Response(body === undefined ? null : JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

let fetchMock;
let roles;
let writeResponse;
let mockExams;

function route(request) {
  const url = new URL(request.url);
  if (url.pathname.endsWith('/auth/me')) return json(200, { id: 9, firstName: 'A', lastName: 'B', roles });
  if (request.method === 'GET' && url.pathname.endsWith('/cycles')) return json(200, CYCLES);
  const stagesOf = url.pathname.match(/\/cycles\/(\d+)\/stages$/);
  if (request.method === 'GET' && stagesOf) return json(200, STAGES[stagesOf[1]] ?? []);
  if (request.method === 'GET' && url.pathname.endsWith('/exam-types')) return json(200, TYPES);
  if (request.method === 'GET' && url.pathname.endsWith('/mock-exams')) {
    return json(200, mockExams[url.searchParams.get('stageId')] ?? []);
  }
  return writeResponse(request);
}

function renderPage() {
  const router = createMemoryRouter(
    [
      { path: '/exams', element: <ExamsPage /> },
      { path: '/imports/:id', element: <p>Revisión de la importación</p> },
    ],
    { initialEntries: ['/exams'] },
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
const examCard = (name) => screen.findByRole('button', { name: `Examen ${name}` });

async function openNewExam() {
  fireEvent.click(screen.getAllByRole('button', { name: /nuevo examen/i })[0]);
  const form = await screen.findByRole('form', { name: 'Nuevo examen' });
  // every type comes checked once the types load
  await waitFor(() => expect(within(form).getByRole('checkbox', { name: 'Arquitectura' })).toBeChecked());
  return form;
}

describe('Exams screen', () => {
  beforeEach(() => {
    roles = ['ADMIN'];
    mockExams = { 11: [REGULAR_1, MEDICION], 10: [], 20: [] };
    writeResponse = () => json(201, REGULAR_1);
    fetchMock = vi.fn((request) => Promise.resolve(route(request)));
    vi.stubGlobal('fetch', fetchMock);
    document.cookie = 'XSRF-TOKEN=csrf-1';
  });

  afterEach(() => vi.unstubAllGlobals());

  it('starts on the stage in force of the active cycle and lists its mock exams with their types', async () => {
    renderPage();

    const regular = (await examCard('Regular 1')).closest('li');
    const types = within(within(regular).getByRole('list', { name: 'Tipos de examen' })).getAllByRole('listitem');
    // a green check once a type has results
    expect(types.map((li) => li.textContent)).toEqual(['Ciencias ✓', 'Letras']);
    expect(within(regular).getByText('14 mar 2026')).toBeInTheDocument();
    expect(screen.getByLabelText('Ciclo')).toHaveValue('1');
    expect(screen.getByLabelText('Etapa')).toHaveValue('11');
    expect(within(screen.getByLabelText('Etapa')).getByRole('option', { name: 'Regular (vigente)' })).toBeInTheDocument();
    const cards = screen.getAllByRole('button', { name: /^Examen / }).map((b) => b.getAttribute('aria-label'));
    expect(cards).toEqual(['Examen Regular 1', 'Examen Medición']);
  });

  it('changing the cycle shows its stages and their mock exams', async () => {
    renderPage();
    await examCard('Regular 1');

    fireEvent.change(screen.getByLabelText('Ciclo'), { target: { value: '2' } });

    await waitFor(() => expect(screen.getByLabelText('Etapa')).toHaveValue('20'));
    expect(await screen.findByText('Aún no hay exámenes en esta etapa.')).toBeInTheDocument();
  });

  it('creates a mock exam with the checked types in one request', async () => {
    renderPage();
    await examCard('Regular 1');
    const form = await openNewExam();

    fireEvent.click(within(form).getByRole('checkbox', { name: 'Arquitectura' }));
    fireEvent.change(within(form).getByLabelText(/Nombre/), { target: { value: ' Regular 2 ' } });
    fireEvent.change(within(form).getByLabelText(/Fecha/), { target: { value: '2026-03-21' } });
    fireEvent.click(within(form).getByRole('button', { name: 'Crear' }));

    expect(await screen.findByText('Examen creado.')).toBeInTheDocument();
    const [request] = writes();
    expect(request.method).toBe('POST');
    expect(new URL(request.url).pathname).toMatch(/\/mock-exams$/);
    expect(request.headers.get('X-XSRF-TOKEN')).toBe('csrf-1');
    expect(await request.json()).toEqual({ stageId: 11, name: 'Regular 2', examDate: '2026-03-21', examTypeIds: [1, 2] });
  });

  it('flags missing data and no type before calling the backend', async () => {
    renderPage();
    await examCard('Regular 1');
    const form = await openNewExam();

    ['Ciencias', 'Letras', 'Arquitectura'].forEach((name) => fireEvent.click(within(form).getByRole('checkbox', { name })));
    fireEvent.click(within(form).getByRole('button', { name: 'Crear' }));

    expect(await within(form).findByText('El examen necesita un nombre.')).toBeInTheDocument();
    expect(within(form).getByText('Ingresa la fecha del examen.')).toBeInTheDocument();
    expect(within(form).getByText('Elige al menos un tipo de examen.')).toBeInTheDocument();
    expect(writes()).toHaveLength(0);
  });

  it('keeps the form open with the backend message', async () => {
    writeResponse = () => json(409, { status: 409, detail: 'Ya existe un examen con ese nombre en esta etapa.' });
    renderPage();
    await examCard('Regular 1');
    const form = await openNewExam();

    fireEvent.change(within(form).getByLabelText(/Nombre/), { target: { value: 'Regular 1' } });
    fireEvent.change(within(form).getByLabelText(/Fecha/), { target: { value: '2026-03-14' } });
    fireEvent.click(within(form).getByRole('button', { name: 'Crear' }));

    expect(await within(form).findByText('Ya existe un examen con ese nombre en esta etapa.')).toBeInTheDocument();
  });

  it('renames a mock exam for every type and deletes one without results after confirming', async () => {
    writeResponse = (request) => (request.method === 'DELETE' ? json(204) : json(200, MEDICION));
    renderPage();
    fireEvent.click(await examCard('Medición'));
    const form = await screen.findByRole('form', { name: 'Medición' });

    expect(within(form).getByText('El nombre y la fecha se aplican a todos sus tipos.')).toBeInTheDocument();
    const save = within(form).getByRole('button', { name: 'Guardar' });
    expect(save).toBeDisabled();
    fireEvent.change(within(form).getByLabelText(/Nombre/), { target: { value: 'Nivelación' } });
    await waitFor(() => expect(save).toBeEnabled());
    fireEvent.click(save);

    expect(await screen.findByText('Examen actualizado.')).toBeInTheDocument();
    const [update] = writes();
    expect(update.method).toBe('PUT');
    expect(new URL(update.url).pathname).toMatch(/\/mock-exams\/99$/);
    expect(await update.json()).toEqual({ name: 'Nivelación', examDate: '2026-03-02' });

    fireEvent.click(await examCard('Medición'));
    const again = await screen.findByRole('form', { name: 'Medición' });
    fireEvent.click(within(again).getByRole('button', { name: 'Eliminar' }));
    const dialog = await screen.findByRole('dialog', { name: '¿Eliminar examen?' });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Eliminar' }));

    expect(await screen.findByText('Examen eliminado.')).toBeInTheDocument();
    const removal = writes()[1];
    expect(removal.method).toBe('DELETE');
    expect(new URL(removal.url).pathname).toMatch(/\/mock-exams\/99$/);
  });

  it('adds a missing type and removes one without results', async () => {
    writeResponse = () => json(200, REGULAR_1);
    renderPage();
    fireEvent.click(await examCard('Regular 1'));
    const form = await screen.findByRole('form', { name: 'Regular 1' });
    const types = within(form).getByRole('list', { name: 'Tipos de examen' });

    // a type with results can't be removed; one without can
    expect(within(types).queryByRole('button', { name: 'Quitar Ciencias' })).not.toBeInTheDocument();
    fireEvent.click(within(types).getByRole('button', { name: 'Quitar Letras' }));
    expect(await screen.findByText('Se quitó Letras.')).toBeInTheDocument();
    const [removal] = writes();
    expect(removal.method).toBe('DELETE');
    expect(new URL(removal.url).pathname).toMatch(/\/mock-exams\/100\/exams\/1002$/);

    // only the missing types are offered
    const add = within(form).getByLabelText('Agregar tipo');
    await within(add).findByRole('option', { name: 'Arquitectura' });
    expect(within(add).getAllByRole('option').map((o) => o.textContent)).toEqual(['Elige un tipo…', 'Arquitectura']);
    fireEvent.change(add, { target: { value: '3' } });
    fireEvent.click(within(form).getByRole('button', { name: 'Agregar' }));

    expect(await screen.findByText('Tipo de examen agregado.')).toBeInTheDocument();
    const addition = writes()[1];
    expect(addition.method).toBe('POST');
    expect(new URL(addition.url).pathname).toMatch(/\/mock-exams\/100\/exams$/);
    expect(await addition.json()).toEqual({ examTypeId: 3 });
  });

  it('a mock exam with results cannot be deleted but keeps its name and date editable', async () => {
    renderPage();
    fireEvent.click(await examCard('Regular 1'));
    const form = await screen.findByRole('form', { name: 'Regular 1' });

    expect(within(form).queryByRole('button', { name: 'Eliminar' })).not.toBeInTheDocument();
    expect(within(form).getByLabelText(/Nombre/)).toBeEnabled();
    expect(within(form).getByText('Con resultados')).toBeInTheDocument();
  });

  it('the only type of a mock exam cannot be removed', async () => {
    renderPage();
    fireEvent.click(await examCard('Medición'));
    const form = await screen.findByRole('form', { name: 'Medición' });

    expect(within(form).queryByRole('button', { name: 'Quitar Ciencias' })).not.toBeInTheDocument();
  });

  it('a tutor reads the mock exams without creating or editing them', async () => {
    roles = ['TUTOR'];
    renderPage();
    fireEvent.click(await examCard('Regular 1'));
    const form = await screen.findByRole('form', { name: 'Regular 1' });

    expect(screen.queryByRole('button', { name: /nuevo examen/i })).not.toBeInTheDocument();
    expect(within(form).getByLabelText(/Nombre/)).toBeDisabled();
    expect(within(form).queryByRole('button', { name: 'Guardar' })).not.toBeInTheDocument();
    expect(within(form).queryByRole('button', { name: 'Eliminar' })).not.toBeInTheDocument();
    expect(within(form).queryByRole('button', { name: /^Quitar/ })).not.toBeInTheDocument();
    expect(within(form).queryByLabelText('Agregar tipo')).not.toBeInTheDocument();
    expect(within(form).getByText('Solo el administrador y el coordinador editan los exámenes.')).toBeInTheDocument();
  });

  it('imports the results of a type without them: shows the exam, asks and opens the review', async () => {
    roles = ['TUTOR'];
    writeResponse = () => json(201, { id: 7 });
    const router = renderPage();
    fireEvent.click(await examCard('Regular 1'));
    const sheet = await screen.findByRole('form', { name: 'Regular 1' });

    // Ciencias already has results: only Letras can be imported
    expect(within(sheet).queryByRole('button', { name: 'Importar resultados de Ciencias' })).not.toBeInTheDocument();
    fireEvent.click(within(sheet).getByRole('button', { name: 'Importar resultados de Letras' }));

    const form = await screen.findByRole('form', { name: 'Importar resultados' });
    expect(within(form).getByText('Regular 1 · 14 mar 2026')).toBeInTheDocument();
    expect(within(form).getByText('2026-I · Regular')).toBeInTheDocument();
    expect(within(form).getByText('Letras')).toBeInTheDocument();
    expect(within(form).getByRole('button', { name: 'Importar' })).toBeDisabled();
    const file = new File(['excel'], 'GENERALES LETRAS.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    fireEvent.change(within(form).getByLabelText('Archivo de resultados'), { target: { files: [file] } });
    fireEvent.click(within(form).getByRole('button', { name: 'Importar' }));

    const dialog = await screen.findByRole('dialog', { name: '¿Importar resultados?' });
    expect(writes()).toHaveLength(0); // nothing is sent before confirming
    expect(within(dialog).getByText(/GENERALES LETRAS.xlsx como los resultados de Regular 1 · Letras/)).toBeInTheDocument();
    fireEvent.click(within(dialog).getByRole('button', { name: 'Importar' }));

    await waitFor(() => expect(router.state.location.pathname).toBe('/imports/7'));
    const [request] = writes();
    expect(request.method).toBe('POST');
    expect(new URL(request.url).pathname).toMatch(/\/exams\/1002\/results\/import$/);
    expect((await request.formData()).get('file')).toBeTruthy();
  });

  it('shows why the file was rejected and lets the user pick another one', async () => {
    writeResponse = () =>
      json(400, { detail: 'El archivo es de Ciencias y el examen es de Letras: sube el archivo de Letras.' });
    renderPage();
    fireEvent.click(await examCard('Regular 1'));
    fireEvent.click(await screen.findByRole('button', { name: 'Importar resultados de Letras' }));
    const form = await screen.findByRole('form', { name: 'Importar resultados' });
    const file = new File(['excel'], 'GENERALES CIENCIAS.xlsx');
    fireEvent.change(within(form).getByLabelText('Archivo de resultados'), { target: { files: [file] } });
    fireEvent.click(within(form).getByRole('button', { name: 'Importar' }));
    fireEvent.click(within(await screen.findByRole('dialog')).getByRole('button', { name: 'Importar' }));

    expect(await within(form).findByText(/El archivo es de Ciencias/)).toBeInTheDocument();
    expect(within(form).getByRole('button', { name: 'Importar' })).toBeEnabled();
  });

  it('results are only imported in the stage in force of the active cycle', async () => {
    mockExams = { ...mockExams, 10: [{ ...MEDICION, id: 98, stageId: 10, name: 'Simulacro de enero' }] };
    renderPage();
    await examCard('Regular 1');
    fireEvent.change(screen.getByLabelText('Etapa'), { target: { value: '10' } });
    fireEvent.click(await examCard('Simulacro de enero'));
    const sheet = await screen.findByRole('form', { name: 'Simulacro de enero' });

    expect(within(sheet).getByText('Sin resultados')).toBeInTheDocument();
    expect(within(sheet).queryByRole('button', { name: /^Importar resultados/ })).not.toBeInTheDocument();
  });

  it('a coordinator manages mock exams too', async () => {
    roles = ['COORDINADOR'];
    renderPage();
    await examCard('Regular 1');

    expect(screen.getAllByRole('button', { name: /nuevo examen/i }).length).toBeGreaterThan(0);
  });
});
