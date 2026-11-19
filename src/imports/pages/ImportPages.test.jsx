import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ThemeProvider } from '@mui/material/styles';
import { NotificationProvider } from '../../app/notifications';
import { makeStore } from '../../app/store';
import { theme } from '../../app/theme';
import ImportStudentsForm from '../components/ImportStudentsForm';
import ImportBatchPage from './ImportBatchPage';
import ImportsPage from './ImportsPage';

const CYCLES = [{ id: 1, name: '2026-I', status: 'ACTIVE' }];
const STAGES = [
  { id: 10, cycleId: 1, name: 'Nivelación', status: 'CLOSED', current: false },
  { id: 11, cycleId: 1, name: 'Regular', status: 'ACTIVE', current: true },
];
// invented people
const QUISPE = { id: 7, fullName: 'Quispe Mamani, Lucía', dni: '72345678', active: true };
const ROJAS = { id: 8, fullName: 'Rojas, Mateo', dni: null, active: true };
const ROW_NEW = {
  id: 101,
  rowNumber: 2,
  status: 'NEW_STUDENT',
  fullName: 'Díaz Soto, Valeria',
  dni: '70011223',
  careerText: 'letras',
  careerName: 'Letras',
  tutorText: 'SILVIA',
  tutorName: 'Valle Gómez, Silvia',
  notice: null,
  student: null,
  candidates: [],
};
const ROW_MATCHED = { ...ROW_NEW, id: 102, rowNumber: 3, status: 'AUTO_MATCHED', fullName: 'Quispe, Lucia', dni: '72345678', careerName: null, careerText: 'Medicina', tutorName: null, tutorText: null, student: QUISPE };
const ROW_UNRESOLVED = { ...ROW_NEW, id: 103, rowNumber: 4, status: 'UNRESOLVED', fullName: 'Roja, Mateo', dni: null, candidates: [ROJAS] };
const BATCH = {
  id: 5,
  type: 'STUDENTS',
  status: 'PENDING_REVIEW',
  fileName: 'alumnos.xlsx',
  stageId: 11,
  stageLabel: '2026-I · Regular',
  uploadedAt: '2026-11-15T10:00:00-05:00',
  totalRows: 3,
  newRows: 1,
  matchedRows: 1,
  unresolvedRows: 1,
  ignoredRows: 0,
  rows: [ROW_NEW, ROW_MATCHED, ROW_UNRESOLVED],
};

// an exam results batch (EXAM_RESULTS)
const RESULT = { attended: true, totalCorrect: 24, totalWrong: 6, totalScore: 722.76, areas: [{ areaName: 'Lectura', score: 787.5 }, { areaName: 'Matemática', score: 819.4 }] };
const RESULT_MATCHED = {
  id: 201,
  rowNumber: 12,
  status: 'AUTO_MATCHED',
  fullName: 'ROJAS MATEO',
  dni: null,
  notice: 'No está matriculado en la etapa: se matriculará al confirmar en Letras.',
  student: ROJAS,
  candidates: [],
  enrolls: true,
  newStudent: null,
  tutorText: 'SILVIA',
  tutorName: 'Valle Gómez, Silvia',
  result: RESULT,
};
const RESULT_UNKNOWN = {
  ...RESULT_MATCHED,
  id: 202,
  rowNumber: 13,
  status: 'UNRESOLVED',
  fullName: 'TORRES VEGA ANA SOFIA',
  dni: '71112223',
  notice: null,
  student: null,
  enrolls: false,
  // the file names someone who is not a tutor
  tutorText: 'XIMENA',
  tutorName: null,
};
const RESULT_ABSENT = {
  ...RESULT_MATCHED,
  id: 203,
  rowNumber: 14,
  fullName: 'QUISPE MAMANI LUCIA',
  dni: '72345678',
  notice: null,
  student: QUISPE,
  enrolls: false,
  result: { ...RESULT, attended: false, totalCorrect: 0, totalWrong: 0, totalScore: 80 },
};
let resultsBatch;
const RESULTS_BATCH = {
  id: 6,
  type: 'EXAM_RESULTS',
  status: 'PENDING_REVIEW',
  fileName: 'GENERALES LETRAS.xlsx',
  stageId: 11,
  stageLabel: '2026-I · Regular',
  examId: 1002,
  examLabel: 'Repaso 1 · Letras',
  uploadedAt: '2026-11-16T10:00:00-05:00',
  totalRows: 3,
  newRows: 0,
  matchedRows: 2,
  unresolvedRows: 1,
  ignoredRows: 0,
  skippedRows: 4,
  rows: [RESULT_MATCHED, RESULT_UNKNOWN, RESULT_ABSENT],
};

function json(status, body) {
  return new Response(body === undefined ? null : JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

let fetchMock;
let batch;
// the imports list, when a test needs many (null = the batch alone)
let batchList = null;
let writeResponse;

function route(request) {
  const url = new URL(request.url);
  if (url.pathname.endsWith('/auth/me')) return json(200, { id: 9, firstName: 'A', lastName: 'B', roles: ['TUTOR'] });
  if (request.method === 'GET' && url.pathname.endsWith('/cycles')) return json(200, CYCLES);
  if (request.method === 'GET' && url.pathname.endsWith('/cycles/1/stages')) return json(200, STAGES);
  if (request.method === 'GET' && url.pathname.endsWith('/student-search')) {
    return json(200, url.searchParams.get('query').toLowerCase().startsWith('quis') ? [QUISPE] : []);
  }
  if (request.method === 'GET' && url.pathname.endsWith('/import-batches')) return json(200, batchList ?? [{ ...batch, rows: [] }]);
  if (request.method === 'GET' && url.pathname.endsWith('/import-batches/6')) return json(200, resultsBatch);
  if (request.method === 'GET' && url.pathname.endsWith('/import-batches/5')) return json(200, batch);
  return writeResponse(request);
}

function renderAt(path) {
  const router = createMemoryRouter(
    [
      { path: '/students', element: <ImportStudentsForm onClose={() => {}} /> },
      { path: '/imports', element: <ImportsPage /> },
      { path: '/imports/:id', element: <ImportBatchPage /> },
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

describe('Importing students', () => {
  beforeEach(() => {
    batch = BATCH;
    writeResponse = () => json(201, BATCH);
    fetchMock = vi.fn((request) => Promise.resolve(route(request)));
    vi.stubGlobal('fetch', fetchMock);
    document.cookie = 'XSRF-TOKEN=csrf-1';
  });

  afterEach(() => vi.unstubAllGlobals());

  async function chooseFile(form) {
    const file = new File(['excel'], 'alumnos.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    fireEvent.change(within(form).getByLabelText('Archivo de alumnos'), { target: { files: [file] } });
    return file;
  }

  it('uploads the file to enroll in the stage in force and opens the review', async () => {
    const router = renderAt('/students');
    const form = await screen.findByRole('form', { name: 'Importar alumnos' });
    expect(within(form).getByRole('link', { name: 'Descargar plantilla' })).toHaveAttribute('href', '/api/v1/student-imports/template');

    await waitFor(() => expect(within(form).getByLabelText('Etapa')).toHaveValue('11'));
    expect(within(form).getByRole('button', { name: 'Subir y revisar' })).toBeDisabled();
    await chooseFile(form);
    fireEvent.click(within(form).getByRole('button', { name: 'Subir y revisar' }));

    await waitFor(() => expect(router.state.location.pathname).toBe('/imports/5'));
    const [request] = writes();
    expect(request.method).toBe('POST');
    expect(new URL(request.url).pathname).toMatch(/\/student-imports$/);
    expect(new URL(request.url).searchParams.get('stageId')).toBe('11');
    expect(request.headers.get('X-XSRF-TOKEN')).toBe('csrf-1');
    // (jsdom's File loses its name crossing into Node's fetch; a browser sends it)
    expect((await request.formData()).get('file')).toBeTruthy();
  });

  it('can only register them, without enrolling', async () => {
    renderAt('/students');
    const form = await screen.findByRole('form', { name: 'Importar alumnos' });
    await waitFor(() => expect(within(form).getByLabelText('Matricular en el ciclo')).toHaveValue('1'));

    fireEvent.change(within(form).getByLabelText('Matricular en el ciclo'), { target: { value: '' } });
    expect(within(form).queryByLabelText('Etapa')).not.toBeInTheDocument();
    await chooseFile(form);
    fireEvent.click(within(form).getByRole('button', { name: 'Subir y revisar' }));

    await waitFor(() => expect(writes()).toHaveLength(1));
    expect(new URL(writes()[0].url).searchParams.get('stageId')).toBeNull();
  });

  it('shows why a file was rejected', async () => {
    writeResponse = () =>
      json(400, { status: 400, detail: 'Corrige el archivo y vuelve a subirlo: fila 3: El DNI debe tener entre 8 y 12 letras o números.' });
    renderAt('/students');
    const form = await screen.findByRole('form', { name: 'Importar alumnos' });
    await chooseFile(form);
    fireEvent.click(within(form).getByRole('button', { name: 'Subir y revisar' }));

    expect(await within(form).findByText(/fila 3: El DNI debe tener/)).toBeInTheDocument();
  });

  it('reviews the batch: counts, unresolved rows first, and confirm only when all are resolved', async () => {
    renderAt('/imports/5');

    expect(await screen.findByRole('heading', { name: 'Revisión de importación' })).toBeInTheDocument();
    expect(screen.getByText('alumnos.xlsx · Matricular en 2026-I · Regular')).toBeInTheDocument();
    expect(screen.getByText(/Aún no se guardó nada.*Solo quedan "Sin resolver" las\s+filas que necesitan tu decisión/s)).toBeInTheDocument();
    expect(screen.getByText('2 de 3 filas resueltas')).toBeInTheDocument();
    // the unresolved rows come first
    const rows = within(screen.getByRole('list', { name: 'Filas' })).getAllByRole('listitem');
    expect(rows).toHaveLength(1);
    expect(within(rows[0]).getByText('Roja, Mateo')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Confirmar importación' })).toBeDisabled();

    fireEvent.click(screen.getByRole('button', { name: 'Resueltas · 2' }));
    const resolved = within(screen.getByRole('list', { name: 'Filas' })).getAllByRole('listitem');
    expect(within(resolved[0]).getByText('DNI 70011223 · Letras · Tutor: Valle Gómez, Silvia')).toBeInTheDocument();
    expect(within(resolved[0]).queryByText('Sin carrera')).not.toBeInTheDocument();
    // a row left without career or tutor is marked at a glance
    expect(within(resolved[1]).getByText('DNI 72345678')).toBeInTheDocument();
    expect(within(resolved[1]).getByText('Sin carrera')).toBeInTheDocument();
    expect(within(resolved[1]).getByText('Sin tutor')).toBeInTheDocument();
    expect(within(resolved[1]).getByText('→ Quispe Mamani, Lucía')).toBeInTheDocument();
  });

  it('filters the rows by what they are and by missing career or tutor', async () => {
    renderAt('/imports/5');
    await screen.findByRole('heading', { name: 'Revisión de importación' });
    const shown = () =>
      within(screen.getByRole('list', { name: 'Filas' }))
        .getAllByRole('button')
        .map((b) => b.getAttribute('aria-label'));

    fireEvent.click(screen.getByRole('button', { name: 'Alumnos nuevos · 1' }));
    expect(shown()).toEqual(['Fila 2: Díaz Soto, Valeria']);
    fireEvent.click(screen.getByRole('button', { name: 'Actualiza datos · 1' }));
    expect(shown()).toEqual(['Fila 3: Quispe, Lucia']);
    fireEvent.click(screen.getByRole('button', { name: 'Sin carrera · 1' }));
    expect(shown()).toEqual(['Fila 3: Quispe, Lucia']);
    fireEvent.click(screen.getByRole('button', { name: 'Sin tutor · 1' }));
    expect(shown()).toEqual(['Fila 3: Quispe, Lucia']);
  });

  it('a batch that only registers does not mark missing careers or tutors', async () => {
    batch = { ...BATCH, stageId: null, stageLabel: null };
    renderAt('/imports/5');
    await screen.findByRole('heading', { name: 'Revisión de importación' });

    expect(screen.queryByRole('button', { name: /^Sin carrera/ })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Resueltas · 2' }));
    expect(screen.queryByText('Sin tutor')).not.toBeInTheDocument();
  });

  it('resolves a row with a suggested student', async () => {
    writeResponse = () => json(200, BATCH);
    renderAt('/imports/5');
    fireEvent.click(await screen.findByRole('button', { name: 'Fila 4: Roja, Mateo' }));
    const sheet = await screen.findByRole('form', { name: 'Fila 4' });

    const save = within(sheet).getByRole('button', { name: 'Guardar resolución' });
    expect(save).toBeDisabled();
    fireEvent.click(within(sheet).getByRole('radio', { name: /Rojas, Mateo/ }));
    fireEvent.click(save);

    expect(await screen.findByText('Fila 4 resuelta.')).toBeInTheDocument();
    const [request] = writes();
    expect(request.method).toBe('PUT');
    expect(new URL(request.url).pathname).toMatch(/\/import-batches\/5\/rows\/103$/);
    expect(await request.json()).toEqual({ action: 'MATCH', studentId: 8 });
  });

  it('finds another student by name or DNI, or makes the row a new student', async () => {
    writeResponse = () => json(200, BATCH);
    renderAt('/imports/5');
    fireEvent.click(await screen.findByRole('button', { name: 'Fila 4: Roja, Mateo' }));
    let sheet = await screen.findByRole('form', { name: 'Fila 4' });

    fireEvent.change(within(sheet).getByLabelText('Buscar otro alumno'), { target: { value: 'quispe' } });
    fireEvent.click(await within(sheet).findByRole('radio', { name: /Quispe Mamani, Lucía/ }));
    fireEvent.click(within(sheet).getByRole('button', { name: 'Guardar resolución' }));
    await screen.findByText('Fila 4 resuelta.');
    expect(await writes()[0].json()).toEqual({ action: 'MATCH', studentId: 7 });
    const search = requests().find((r) => new URL(r.url).pathname.endsWith('/student-search'));
    expect(new URL(search.url).searchParams.get('query')).toBe('quispe');

    fireEvent.click(screen.getByRole('button', { name: 'Fila 4: Roja, Mateo' }));
    sheet = await screen.findByRole('form', { name: 'Fila 4' });
    fireEvent.click(within(sheet).getByRole('radio', { name: 'Es un alumno nuevo' }));
    fireEvent.click(within(sheet).getByRole('button', { name: 'Guardar resolución' }));
    await waitFor(() => expect(writes()).toHaveLength(2));
    expect(await writes()[1].json()).toEqual({ action: 'NEW', studentId: null });
  });

  it('clearing the search removes its results, but keeps a student already picked from it', async () => {
    renderAt('/imports/5');
    fireEvent.click(await screen.findByRole('button', { name: 'Fila 4: Roja, Mateo' }));
    const sheet = await screen.findByRole('form', { name: 'Fila 4' });
    const box = within(sheet).getByLabelText('Buscar otro alumno');

    fireEvent.change(box, { target: { value: 'quispe' } });
    await within(sheet).findByRole('radio', { name: /Quispe Mamani, Lucía/ });
    fireEvent.change(box, { target: { value: '' } });
    await waitFor(() => expect(within(sheet).queryByRole('radio', { name: /Quispe Mamani, Lucía/ })).not.toBeInTheDocument());

    fireEvent.change(box, { target: { value: 'quispe' } });
    fireEvent.click(await within(sheet).findByRole('radio', { name: /Quispe Mamani, Lucía/ }));
    fireEvent.change(box, { target: { value: '' } });
    // wait past the search delay: the picked student is still there, and selected
    await new Promise((resolve) => setTimeout(resolve, 400));
    expect(within(sheet).getByRole('radio', { name: /Quispe Mamani, Lucía/ })).toBeChecked();
  });

  it('confirms after asking, once every row is resolved', async () => {
    batch = { ...BATCH, unresolvedRows: 0, matchedRows: 2, rows: [ROW_NEW, ROW_MATCHED, { ...ROW_UNRESOLVED, status: 'MANUAL_MATCHED', student: ROJAS }] };
    writeResponse = () => json(200, { ...batch, status: 'CONFIRMED' });
    renderAt('/imports/5');

    fireEvent.click(await screen.findByRole('button', { name: 'Confirmar importación' }));
    const dialog = await screen.findByRole('dialog', { name: '¿Confirmar importación?' });
    expect(within(dialog).getByText(/Se registrarán 1 alumno nuevo y se actualizarán los datos de 2 ya registrados. Los 3 quedarán matriculados en 2026-I · Regular/)).toBeInTheDocument();
    fireEvent.click(within(dialog).getByRole('button', { name: 'Confirmar' }));

    expect(await screen.findByText('Importación confirmada.')).toBeInTheDocument();
    const [request] = writes();
    expect(request.method).toBe('POST');
    expect(new URL(request.url).pathname).toMatch(/\/import-batches\/5\/confirm$/);
  });

  it('discards after asking and goes back to the imports', async () => {
    writeResponse = () => json(204);
    const router = renderAt('/imports/5');

    fireEvent.click(await screen.findByRole('button', { name: 'Descartar importación' }));
    const dialog = await screen.findByRole('dialog', { name: '¿Descartar importación?' });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Descartar' }));

    await waitFor(() => expect(router.state.location.pathname).toBe('/imports'));
    expect(new URL(writes()[0].url).pathname).toMatch(/\/import-batches\/5\/discard$/);
  });

  it('a confirmed batch is read-only', async () => {
    batch = { ...BATCH, status: 'CONFIRMED' };
    renderAt('/imports/5');

    expect(await screen.findByText('Confirmada')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Confirmar importación' })).not.toBeInTheDocument();
    expect(screen.queryByText(/Aún no se guardó nada/)).not.toBeInTheDocument();
  });

  it('pages the imports by 10', async () => {
    batchList = Array.from({ length: 12 }, (_, i) => ({ ...batch, id: 100 + i, fileName: `lote-${i + 1}.xlsx`, rows: [] }));
    renderAt('/imports');
    await screen.findByRole('button', { name: 'Importación lote-1.xlsx' });
    expect(screen.getAllByRole('button', { name: /^Importación lote-/ })).toHaveLength(10);
    fireEvent.click(screen.getByRole('button', { name: 'Página siguiente' }));
    expect(screen.getAllByRole('button', { name: /^Importación lote-/ })).toHaveLength(2);
    batchList = null;
  });

  it('lists the imports to resume a pending one', async () => {
    const router = renderAt('/imports');

    const item = await screen.findByRole('button', { name: 'Importación alumnos.xlsx' });
    expect(within(item).getByText('Pendiente')).toBeInTheDocument();
    expect(within(item).getByText(/3 filas · 1 por revisar/)).toBeInTheDocument();
    fireEvent.click(item);
    await waitFor(() => expect(router.state.location.pathname).toBe('/imports/5'));
  });
});

describe('Reviewing exam results', () => {
  beforeEach(() => {
    batch = { ...RESULTS_BATCH, rows: [] };
    resultsBatch = RESULTS_BATCH;
    writeResponse = () => json(200, RESULTS_BATCH);
    fetchMock = vi.fn((request) => Promise.resolve(route(request)));
    vi.stubGlobal('fetch', fetchMock);
    document.cookie = 'XSRF-TOKEN=csrf-1';
  });

  afterEach(() => vi.unstubAllGlobals());

  it('shows the exam, the counts with the skipped rows, and filters by what each row will do', async () => {
    renderAt('/imports/6');

    expect(await screen.findByText(/Resultados de Repaso 1 · Letras · 2026-I · Regular · GENERALES LETRAS.xlsx/)).toBeInTheDocument();
    expect(screen.getByText('descartadas por ser filas vacías o basura').previousSibling).toHaveTextContent('4');
    expect(screen.getByText('calzaron con un alumno').previousSibling).toHaveTextContent('2');
    expect(screen.getByRole('button', { name: 'Se matricularán · 1' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'No asistieron · 1' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^Sin carrera/ })).not.toBeInTheDocument();

    // unresolved first
    const unknown = screen.getByRole('button', { name: 'Fila 13: TORRES VEGA ANA SOFIA' });
    expect(within(unknown).getByText('DNI 71112223 · Total 722.76 · Lectura 787.5 · Matemática 819.4')).toBeInTheDocument();
    expect(within(unknown).getByText('Sin tutor')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sin tutor · 1' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Se matricularán · 1' }));
    const enrolling = screen.getByRole('button', { name: 'Fila 12: ROJAS MATEO' });
    expect(within(enrolling).getByText('Se matriculará')).toBeInTheDocument();
    expect(within(enrolling).getByText('→ Rojas, Mateo')).toBeInTheDocument();
    expect(within(enrolling).getByText(/· Tutor: Valle Gómez, Silvia$/)).toBeInTheDocument();
    expect(within(enrolling).queryByText('Sin tutor')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'No asistieron · 1' }));
    expect(within(screen.getByRole('button', { name: 'Fila 14: QUISPE MAMANI LUCIA' })).getByText('No asistió')).toBeInTheDocument();
  });

  it('registers an unknown row as a new student, with its names split by hand', async () => {
    renderAt('/imports/6');
    fireEvent.click(await screen.findByRole('button', { name: 'Fila 13: TORRES VEGA ANA SOFIA' }));
    const sheet = await screen.findByRole('form', { name: 'Fila 13' });
    expect(within(sheet).getByText('722.76')).toBeInTheDocument();
    expect(within(sheet).getByText('Sin tutor ("XIMENA" no se encontró)')).toBeInTheDocument();

    fireEvent.click(within(sheet).getByRole('radio', { name: 'Es un alumno nuevo' }));
    // the file's cell, split as usual and out of capitals
    expect(within(sheet).getByLabelText(/Apellido paterno/)).toHaveValue('Torres');
    expect(within(sheet).getByLabelText(/Apellido materno/)).toHaveValue('Vega');
    const names = within(sheet).getByLabelText(/Nombres/);
    expect(names).toHaveValue('Ana Sofia');

    fireEvent.change(names, { target: { value: ' ' } });
    fireEvent.click(within(sheet).getByRole('button', { name: 'Guardar resolución' }));
    expect(await within(sheet).findByText('Ingresa los nombres del alumno.')).toBeInTheDocument();
    expect(writes()).toHaveLength(0);

    fireEvent.change(names, { target: { value: 'Ana Sofía' } });
    fireEvent.click(within(sheet).getByRole('button', { name: 'Guardar resolución' }));
    await screen.findByText('Fila 13 resuelta.');
    const [request] = writes();
    expect(new URL(request.url).pathname).toMatch(/\/import-batches\/6\/rows\/202$/);
    expect(await request.json()).toEqual({ action: 'NEW', studentId: null, lastNamePat: 'Torres', lastNameMat: 'Vega', firstName: 'Ana Sofía' });
  });

  it('confirms after asking, saying what is saved and who gets enrolled', async () => {
    resultsBatch = { ...RESULTS_BATCH, unresolvedRows: 0, ignoredRows: 1, rows: [RESULT_MATCHED, { ...RESULT_UNKNOWN, status: 'IGNORED' }, RESULT_ABSENT] };
    writeResponse = () => json(200, { ...resultsBatch, status: 'CONFIRMED' });
    renderAt('/imports/6');

    fireEvent.click(await screen.findByRole('button', { name: 'Confirmar importación' }));
    const dialog = await screen.findByRole('dialog', { name: '¿Confirmar importación?' });
    expect(
      within(dialog).getByText(
        'Se guardarán los resultados de 2 alumnos en Repaso 1 · Letras. 1 alumno se matriculará en 2026-I · Regular. ' +
          'Quien no tenga tutor recibe el que indica el Excel; un tutor ya asignado no cambia. ' +
          'La fila ignorada no se guarda. Después, este examen ya no acepta otra carga.',
      ),
    ).toBeInTheDocument();
    fireEvent.click(within(dialog).getByRole('button', { name: 'Confirmar' }));

    expect(await screen.findByText('Importación confirmada.')).toBeInTheDocument();
    expect(new URL(writes()[0].url).pathname).toMatch(/\/import-batches\/6\/confirm$/);
  });

  it('a reload warns that it replaces the current results, in the review and when confirming', async () => {
    resultsBatch = {
      ...RESULTS_BATCH,
      replacesResults: true,
      unresolvedRows: 0,
      ignoredRows: 1,
      rows: [RESULT_MATCHED, { ...RESULT_UNKNOWN, status: 'IGNORED' }, RESULT_ABSENT],
    };
    writeResponse = () => json(200, { ...resultsBatch, status: 'CONFIRMED' });
    renderAt('/imports/6');

    expect(await screen.findByText(/Es una recarga: Repaso 1 · Letras ya tiene resultados/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar importación' }));
    const dialog = await screen.findByRole('dialog', { name: '¿Confirmar recarga?' });
    expect(within(dialog).getByText(/^Se reemplazarán los resultados actuales de Repaso 1 · Letras\. Se guardarán los resultados de 2 alumnos/)).toBeInTheDocument();
    // it can be reloaded again: no "ya no acepta otra carga"
    expect(within(dialog).queryByText(/ya no acepta otra carga/)).not.toBeInTheDocument();
    fireEvent.click(within(dialog).getByRole('button', { name: 'Confirmar' }));

    expect(await screen.findByText('Importación confirmada.')).toBeInTheDocument();
  });

  it('lists a reload as such', async () => {
    batch = { ...RESULTS_BATCH, replacesResults: true, rows: [] };
    renderAt('/imports');

    const item = await screen.findByRole('button', { name: 'Importación GENERALES LETRAS.xlsx' });
    expect(within(item).getByText('Recarga de resultados · Repaso 1 · Letras')).toBeInTheDocument();
  });

  it('lists results imports by their exam', async () => {
    renderAt('/imports');

    const item = await screen.findByRole('button', { name: 'Importación GENERALES LETRAS.xlsx' });
    expect(within(item).getByText('Resultados · Repaso 1 · Letras')).toBeInTheDocument();
    expect(within(item).getByText(/3 alumnos · 1 por revisar/)).toBeInTheDocument();
  });

  it('choosing by hand a student with a better result in another type asks which one stays', async () => {
    const candidate = { ...RESULT_UNKNOWN, fullName: 'QUISPE MAMANI LUCI', dni: null, candidates: [QUISPE] };
    resultsBatch = { ...RESULTS_BATCH, rows: [candidate] };
    let calls = 0;
    writeResponse = () => {
      calls += 1;
      return calls === 1
        ? json(409, {
            detail: 'Ya tiene un mejor resultado en Ciencias de este simulacro (650): ¿con cuál se queda?',
            requiresConfirmation: true,
            otherExamTypeName: 'Ciencias',
            otherResult: '650',
            thisResult: '722.76',
          })
        : json(200, RESULTS_BATCH);
    };
    renderAt('/imports/6');
    fireEvent.click(await screen.findByRole('button', { name: 'Fila 13: QUISPE MAMANI LUCI' }));
    const sheet = await screen.findByRole('form', { name: 'Fila 13' });
    fireEvent.click(within(sheet).getByRole('radio', { name: /Quispe Mamani, Lucía/ }));
    fireEvent.click(within(sheet).getByRole('button', { name: 'Guardar resolución' }));

    const alert = await within(sheet).findByRole('alert');
    expect(alert).toHaveTextContent('ya tiene resultado en Ciencias de este examen (650), mejor que el de esta fila (722.76)');
    fireEvent.click(within(alert).getByRole('button', { name: 'Quedarse con este resultado' }));
    await waitFor(() => expect(writes()).toHaveLength(2));
    expect(await writes()[1].clone().json()).toEqual({ action: 'MATCH', studentId: 7, replaceOther: true });
  });

  it('a student with a result in another type of the mock exam is chosen only by replacing it', async () => {
    const crossed = {
      ...RESULT_ABSENT,
      status: 'UNRESOLVED',
      notice: 'Ya tiene resultado en Ciencias de este simulacro: ignora la fila o reemplaza ese resultado.',
      otherExamTypeName: 'Ciencias',
      replacesOther: false,
    };
    resultsBatch = { ...RESULTS_BATCH, rows: [crossed] };
    renderAt('/imports/6');
    fireEvent.click(await screen.findByRole('button', { name: 'Fila 14: QUISPE MAMANI LUCIA' }));
    const sheet = await screen.findByRole('form', { name: 'Fila 14' });
    expect(within(sheet).getByText(/Ya tiene resultado en Ciencias/)).toBeInTheDocument();
    expect(within(sheet).getByText('Elegirlo reemplaza su resultado de Ciencias de este examen')).toBeInTheDocument();

    fireEvent.click(within(sheet).getByRole('radio', { name: /Quispe Mamani, Lucía/ }));
    fireEvent.click(within(sheet).getByRole('button', { name: 'Guardar resolución' }));
    await waitFor(() => expect(writes()).toHaveLength(1));
    expect(await writes()[0].clone().json()).toEqual({ action: 'MATCH', studentId: 7, replaceOther: true });
  });
});
