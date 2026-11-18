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
  { id: 1, name: 'Ciencias', courseIds: [1, 2] },
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

// two courses are enough to exercise the manual result form
const COURSES = [
  { id: 2, areaId: 2, name: 'Álgebra' },
  { id: 1, areaId: 1, name: 'Lectura' },
  { id: 6, areaId: 2, name: 'Estadística' },
];
const AREAS = [
  { id: 2, name: 'Matemática' },
  { id: 1, name: 'Lectura' },
];
const ENROLLMENTS = [
  { enrollmentId: 501, studentId: 1, fullName: 'Paredes, Diego', dni: '70111222', hasResult: true },
  { enrollmentId: 502, studentId: 2, fullName: 'Quispe, Lucía', dni: null, hasResult: false },
];
const DIEGO_RESULT = {
  examId: 1001,
  enrollmentId: 501,
  courseResults: [
    { courseId: 1, courseName: 'Lectura', correct: 20, wrong: 5, blank: 3 },
    { courseId: 2, courseName: 'Álgebra', correct: 6, wrong: 1, blank: 1 },
  ],
  areaScores: [
    { areaId: 1, areaName: 'Lectura', score: 640.5 },
    { areaId: 2, areaName: 'Matemática', score: 600 },
  ],
  totalScore: 586.4,
  attended: true,
  updatedByName: 'Valle Gómez, Silvia',
  updatedAt: '2026-11-17T10:30:00-05:00',
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
  if (request.method === 'GET' && url.pathname.endsWith('/areas')) return json(200, AREAS);
  if (request.method === 'GET' && url.pathname.endsWith('/courses')) return json(200, COURSES);
  if (request.method === 'GET' && url.pathname.endsWith('/exams/1001/enrollments')) return json(200, ENROLLMENTS);
  const resultOf = url.pathname.match(/\/exams\/1001\/results\/(\d+)$/);
  if (request.method === 'GET' && resultOf) {
    return resultOf[1] === '501' ? json(200, DIEGO_RESULT) : json(404, { detail: 'Este alumno todavía no tiene resultado en este examen.' });
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

  it('an exam with an import in review says so, and a new upload offers to go to it or replace it', async () => {
    // Letras has an import waiting in review
    mockExams = {
      ...mockExams,
      11: [{ ...REGULAR_1, exams: REGULAR_1.exams.map((e) => (e.examTypeName === 'Letras' ? { ...e, pendingImportBatchId: 5 } : e)) }, MEDICION],
    };
    writeResponse = (request) =>
      new URL(request.url).searchParams.get('replacePending') === 'true'
        ? json(201, { id: 9 })
        : json(409, {
            detail: 'Este examen ya tiene una importación en revisión: continúala o descártala antes de subir otra.',
            requiresConfirmation: true,
            pendingBatchId: 5,
            pendingFileName: 'GENERALES LETRAS.xlsx',
            pendingUploadedAt: '2026-11-18T10:00:00-05:00',
            pendingUploadedBy: 'Valle Gómez, Silvia',
          });
    const router = renderPage();
    const regular = (await examCard('Regular 1')).closest('li');
    expect(within(regular).getByText('Letras · en revisión')).toBeInTheDocument();
    fireEvent.click(await examCard('Regular 1'));
    const sheet = await screen.findByRole('form', { name: 'Regular 1' });
    expect(within(sheet).getByRole('link', { name: 'Importación en revisión de Letras' })).toHaveAttribute('href', '/imports/5');

    fireEvent.click(within(sheet).getByRole('button', { name: 'Importar resultados de Letras' }));
    const form = await screen.findByRole('form', { name: 'Importar resultados' });
    fireEvent.change(within(form).getByLabelText('Archivo de resultados'), { target: { files: [new File(['excel'], 'LETRAS 2.xlsx')] } });
    fireEvent.click(within(form).getByRole('button', { name: 'Importar' }));
    fireEvent.click(within(await screen.findByRole('dialog', { name: '¿Importar resultados?' })).getByRole('button', { name: 'Importar' }));

    const alert = await within(form).findByRole('alert');
    expect(alert).toHaveTextContent('GENERALES LETRAS.xlsx, subida el 18 nov 2026 por Valle Gómez, Silvia');
    fireEvent.click(within(alert).getByRole('button', { name: 'Descartar la anterior y subir esta' }));
    await waitFor(() => expect(router.state.location.pathname).toBe('/imports/9'));
    expect(new URL(writes().at(-1).url).searchParams.get('replacePending')).toBe('true');
  });

  it('an admin reloads the results of a type that already has them, after a warning', async () => {
    writeResponse = () => json(201, { id: 8 });
    const router = renderPage();
    fireEvent.click(await examCard('Regular 1'));
    const sheet = await screen.findByRole('form', { name: 'Regular 1' });

    // Ciencias has results: it is reloaded; Letras, without them, is imported
    expect(within(sheet).queryByRole('button', { name: 'Recargar resultados de Letras' })).not.toBeInTheDocument();
    fireEvent.click(within(sheet).getByRole('button', { name: 'Recargar resultados de Ciencias' }));

    const form = await screen.findByRole('form', { name: 'Recargar resultados' });
    expect(within(form).getByText(/los resultados actuales se reemplazan por los de este archivo/)).toBeInTheDocument();
    const file = new File(['excel'], 'GENERALES CIENCIAS.xlsx');
    fireEvent.change(within(form).getByLabelText('Archivo de resultados'), { target: { files: [file] } });
    fireEvent.click(within(form).getByRole('button', { name: 'Recargar' }));
    const dialog = await screen.findByRole('dialog', { name: '¿Recargar resultados?' });
    expect(within(dialog).getByText(/al confirmarla se reemplazan/)).toBeInTheDocument();
    fireEvent.click(within(dialog).getByRole('button', { name: 'Recargar' }));

    await waitFor(() => expect(router.state.location.pathname).toBe('/imports/8'));
    const url = new URL(writes()[0].url);
    expect(url.pathname).toMatch(/\/exams\/1001\/results\/import$/);
    expect(url.searchParams.get('reload')).toBe('true');
  });

  it('only an admin gets the reload; a plain import never asks for it', async () => {
    roles = ['COORDINADOR'];
    writeResponse = () => json(201, { id: 7 });
    renderPage();
    fireEvent.click(await examCard('Regular 1'));
    const sheet = await screen.findByRole('form', { name: 'Regular 1' });

    expect(within(sheet).queryByRole('button', { name: /^Recargar resultados/ })).not.toBeInTheDocument();
    fireEvent.click(within(sheet).getByRole('button', { name: 'Importar resultados de Letras' }));
    const form = await screen.findByRole('form', { name: 'Importar resultados' });
    expect(within(form).queryByText(/se reemplazan/)).not.toBeInTheDocument();
    fireEvent.change(within(form).getByLabelText('Archivo de resultados'), { target: { files: [new File(['x'], 'a.xlsx')] } });
    fireEvent.click(within(form).getByRole('button', { name: 'Importar' }));
    fireEvent.click(within(await screen.findByRole('dialog')).getByRole('button', { name: 'Importar' }));

    await waitFor(() => expect(writes()).toHaveLength(1));
    expect(new URL(writes()[0].url).searchParams.has('reload')).toBe(false);
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

  describe('manual result', () => {
    async function openManual() {
      fireEvent.click(await examCard('Regular 1'));
      const sheet = await screen.findByRole('form', { name: 'Regular 1' });
      // only a type with results: Letras has none
      expect(within(sheet).queryByRole('button', { name: 'Resultado manual de Letras' })).not.toBeInTheDocument();
      fireEvent.click(within(sheet).getByRole('button', { name: 'Resultado manual de Ciencias' }));
      return screen.findByRole('region', { name: 'Resultado manual' });
    }

    async function pick(section, text, option) {
      const input = within(section).getByLabelText('Alumno');
      fireEvent.change(input, { target: { value: text } });
      fireEvent.click(await screen.findByRole('option', { name: option }));
    }

    it('a tutor creates the missing result of a student: empty form, every value typed, one request', async () => {
      roles = ['TUTOR'];
      writeResponse = () => json(200, { ...DIEGO_RESULT, enrollmentId: 502 });
      renderPage();
      const section = await openManual();
      expect(within(section).getByText('Regular 1 · Ciencias · 14 mar 2026 · 2026-I · Regular')).toBeInTheDocument();

      await pick(section, 'quis', /Quispe, Lucía/);
      const form = await within(section).findByRole('form', { name: 'Resultado de Quispe, Lucía' });
      expect(within(form).getByText(/aún no tiene resultado/)).toBeInTheDocument();
      // the exam type's courses in catalog order; Estadística is not Ciencias'
      expect(within(form).getAllByRole('listitem').map((li) => li.getAttribute('aria-label'))).toEqual(['Lectura', 'Álgebra']);

      const type = (label, value) => fireEvent.change(within(form).getByLabelText(label), { target: { value } });
      type('Buenas de Lectura', '20');
      type('Malas de Lectura', '5');
      type('En blanco de Lectura', '3');
      type('Buenas de Álgebra', '0');
      type('Malas de Álgebra', '1');
      type('En blanco de Álgebra', '7');
      type('Puntaje de Lectura', '640,5');
      type('Puntaje de Matemática', '600');
      type('Puntaje total', '586.4');
      fireEvent.click(within(form).getByRole('button', { name: 'Guardar' }));

      expect(await screen.findByText('Resultado guardado.')).toBeInTheDocument();
      const [request] = writes();
      expect(request.method).toBe('PUT');
      expect(new URL(request.url).pathname).toMatch(/\/exams\/1001\/results\/502$/);
      expect(await request.json()).toEqual({
        courseResults: [
          { courseId: 1, correct: 20, wrong: 5, blank: 3 },
          { courseId: 2, correct: 0, wrong: 1, blank: 7 },
        ],
        areaScores: [
          { areaId: 1, score: 640.5 },
          { areaId: 2, score: 600 },
        ],
        totalScore: 586.4,
      });
      expect(screen.queryByRole('region', { name: 'Resultado manual' })).not.toBeInTheDocument();
    });

    it('an existing result comes preloaded with who changed it; the backend message keeps the values', async () => {
      writeResponse = () => json(403, { detail: 'Solo puedes registrar resultados de tus alumnos asignados.' });
      renderPage();
      const section = await openManual();
      await pick(section, '7011', /Paredes, Diego/);
      const form = await within(section).findByRole('form', { name: 'Resultado de Paredes, Diego' });

      expect(within(form).getByText(/Última modificación: Valle Gómez, Silvia/)).toBeInTheDocument();
      expect(within(form).getByLabelText('Buenas de Lectura')).toHaveValue('20');
      expect(within(form).getByLabelText('Puntaje de Lectura')).toHaveValue('640.5');
      expect(within(form).getByLabelText('Puntaje total')).toHaveValue('586.4');
      // attended is never typed
      expect(within(form).queryByLabelText(/asisti/i)).not.toBeInTheDocument();

      fireEvent.change(within(form).getByLabelText('Malas de Álgebra'), { target: { value: '2' } });
      fireEvent.click(within(form).getByRole('button', { name: 'Guardar' }));
      expect(await within(form).findByText('Solo puedes registrar resultados de tus alumnos asignados.')).toBeInTheDocument();
      expect(within(form).getByLabelText('Malas de Álgebra')).toHaveValue('2');
    });

    it('flags empty and negative values before calling the backend', async () => {
      renderPage();
      const section = await openManual();
      await pick(section, 'quis', /Quispe, Lucía/);
      const form = await within(section).findByRole('form', { name: 'Resultado de Quispe, Lucía' });
      fireEvent.change(within(form).getByLabelText('Buenas de Lectura'), { target: { value: '-1' } });
      fireEvent.click(within(form).getByRole('button', { name: 'Guardar' }));

      expect((await within(form).findAllByText('Entero de 0 a más')).length).toBeGreaterThan(1);
      expect(within(form).getAllByText('Número de 0 a más, hasta 2 decimales').length).toBe(3);
      expect(writes()).toHaveLength(0);
    });
  });
});
