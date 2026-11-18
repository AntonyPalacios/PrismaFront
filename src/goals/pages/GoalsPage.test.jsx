import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ThemeProvider } from '@mui/material/styles';
import { NotificationProvider } from '../../app/notifications';
import { makeStore } from '../../app/store';
import { theme } from '../../app/theme';
import StudentGoals from '../components/StudentGoals';
import GoalsPage from './GoalsPage';

// every person is invented
const MOCK_EXAMS = [
  { id: 1, name: 'Regular 1', examDate: '2020-03-07', stageName: 'Regular' },
  { id: 3, name: 'Regular 3', examDate: '2099-03-21', stageName: 'Regular' },
];
const USERS = [
  { id: 50, firstName: 'Silvia', lastNamePat: 'Valle', lastNameMat: 'Gómez', roles: ['TUTOR'], active: true },
  { id: 51, firstName: 'Ruth', lastNamePat: 'Salas', lastNameMat: null, roles: ['TUTOR'], active: true },
];
const AREAS = [
  { areaId: 1, areaName: 'Lectura' },
  { areaId: 2, areaName: 'Matemáticas' },
];
const goal = (areaId, suggested, target, actual = null) => ({ areaId, suggested, basedOnExamName: 'Regular 2', target, actual });
const row = (enrollmentId, fullName, extra) => ({
  enrollmentId,
  studentId: enrollmentId + 100,
  fullName,
  tutorName: 'Valle Gómez, Silvia',
  examId: 30,
  examTypeName: 'Letras',
  noExamReason: null,
  attended: null,
  ...extra,
});
const SHEET = {
  mockExamId: 3,
  mockExamName: 'Regular 3',
  examDate: '2099-03-21',
  areas: AREAS,
  rows: [
    // Ana already has her Lectura goal; Matemáticas comes with the suggestion
    row(1, 'Arias, Ana', { goals: [goal(1, 12, 13), goal(2, 7, null)] }),
    // Beto never sat an exam: no suggestion
    row(2, 'Benítez, Beto', { goals: [goal(1, null, null), goal(2, null, null)] }),
    row(4, 'Duarte, Dario', {
      examId: null,
      examTypeName: 'Arquitectura',
      noExamReason: 'EXAM_TYPE_MISSING',
      goals: [goal(1, 9, null), goal(2, 4, null)],
    }),
  ],
};
const PAST_SHEET = {
  ...SHEET,
  mockExamId: 1,
  mockExamName: 'Regular 1',
  rows: [
    row(1, 'Arias, Ana', { attended: true, goals: [goal(1, null, 9, 10), goal(2, null, 6, 5)] }),
    row(2, 'Benítez, Beto', { attended: false, goals: [goal(1, null, 8), goal(2, null, null)] }),
  ],
};

function json(status, body) {
  return new Response(body === undefined ? null : JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

let fetchMock;
let roles;
let saveResponse;

function route(request) {
  const url = new URL(request.url);
  if (url.pathname.endsWith('/auth/me')) return json(200, { id: 50, firstName: 'Silvia', lastName: 'Valle', roles });
  if (url.pathname.endsWith('/users')) return json(200, USERS);
  if (url.pathname.endsWith('/goals/mock-exams')) return json(200, MOCK_EXAMS);
  if (url.pathname.endsWith('/goals/sheet') && request.method === 'GET') {
    return json(200, url.searchParams.get('mockExamId') === '1' ? PAST_SHEET : SHEET);
  }
  if (url.pathname.endsWith('/goals/sheet')) return saveResponse();
  if (url.pathname.endsWith('/goals')) {
    return json(200, [
      { id: 7, mockExamId: 1, mockExamName: 'Regular 1', examDate: '2020-03-07', examTypeName: 'Letras', areaId: 1, areaName: 'Lectura', targetCorrect: 9, actual: 10, attended: true, met: true },
      { id: 8, mockExamId: 1, mockExamName: 'Regular 1', examDate: '2020-03-07', examTypeName: 'Letras', areaId: 2, areaName: 'Matemáticas', targetCorrect: 6, actual: 5, attended: true, met: false },
      { id: 9, mockExamId: 3, mockExamName: 'Regular 3', examDate: '2099-03-21', examTypeName: 'Letras', areaId: 1, areaName: 'Lectura', targetCorrect: 13, actual: null, attended: null, met: null },
    ]);
  }
  return json(404, { detail: 'No encontrado.' });
}

function renderWithStore(element) {
  render(
    <Provider store={makeStore()}>
      <ThemeProvider theme={theme}>
        <NotificationProvider>{element}</NotificationProvider>
      </ThemeProvider>
    </Provider>,
  );
}

function renderPage() {
  const router = createMemoryRouter([{ path: '/goals', element: <GoalsPage /> }], { initialEntries: ['/goals'] });
  renderWithStore(<RouterProvider router={router} />);
}

const sheetRequests = () =>
  fetchMock.mock.calls.map(([r]) => r).filter((r) => r.method === 'GET' && new URL(r.url).pathname.endsWith('/goals/sheet'));
const saves = () => fetchMock.mock.calls.map(([r]) => r).filter((r) => r.method === 'PUT');
const goalInput = (area, name) => screen.getByLabelText(`Meta de ${area} de ${name}`);

describe('Goals', () => {
  beforeEach(() => {
    roles = ['TUTOR'];
    saveResponse = () => json(204);
    fetchMock = vi.fn((request) => Promise.resolve(route(request)));
    vi.stubGlobal('fetch', fetchMock);
    document.cookie = 'XSRF-TOKEN=csrf-1';
  });

  afterEach(() => vi.unstubAllGlobals());

  it('a tutor gets the next mock exam with the goals and the suggestions ready', async () => {
    renderPage();
    await screen.findByRole('table', { name: 'Metas del grupo' });
    expect(screen.getByLabelText('Simulacro')).toHaveValue('3');
    expect(new URL(sheetRequests()[0].url).searchParams.get('tutorId')).toBeNull();
    // a tutor never picks a tutor
    expect(screen.queryByLabelText('Tutor')).not.toBeInTheDocument();

    expect(goalInput('Lectura', 'Arias, Ana')).toHaveValue('13');
    expect(goalInput('Matemáticas', 'Arias, Ana')).toHaveValue('7');
    expect(screen.getByText('Sugerida (Regular 2 + 2)')).toBeInTheDocument();
    expect(goalInput('Lectura', 'Benítez, Beto')).toHaveValue('');
    expect(goalInput('Lectura', 'Duarte, Dario')).toBeDisabled();
    expect(screen.getByText('Este simulacro no tiene Arquitectura.')).toBeInTheDocument();
  });

  it('saves the suggestions accepted and what was typed, in one request', async () => {
    renderPage();
    await screen.findByRole('table', { name: 'Metas del grupo' });
    fireEvent.change(goalInput('Lectura', 'Benítez, Beto'), { target: { value: '8' } });
    // emptying a saved goal removes it
    fireEvent.change(goalInput('Lectura', 'Arias, Ana'), { target: { value: '' } });
    fireEvent.click(screen.getByRole('button', { name: 'Guardar metas' }));

    expect(await screen.findByText('Metas guardadas.')).toBeInTheDocument();
    expect(await saves()[0].clone().json()).toEqual({
      mockExamId: 3,
      goals: [
        { enrollmentId: 1, areaId: 1, targetCorrect: null },
        { enrollmentId: 1, areaId: 2, targetCorrect: 7 },
        { enrollmentId: 2, areaId: 1, targetCorrect: 8 },
      ],
    });
  });

  it('only whole numbers, and the backend message keeps what was typed', async () => {
    saveResponse = () => json(409, { detail: 'Un alumno del lote no tiene examen en este simulacro: no se le puede fijar una meta.' });
    renderPage();
    await screen.findByRole('table', { name: 'Metas del grupo' });
    fireEvent.change(goalInput('Lectura', 'Benítez, Beto'), { target: { value: '8.5' } });
    expect(screen.getByText('Entero de 0 a 999')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Guardar metas' })).toBeDisabled();

    fireEvent.change(goalInput('Lectura', 'Benítez, Beto'), { target: { value: '8' } });
    fireEvent.click(screen.getByRole('button', { name: 'Guardar metas' }));
    expect(await screen.findByText('Un alumno del lote no tiene examen en este simulacro: no se le puede fijar una meta.')).toBeInTheDocument();
    expect(goalInput('Lectura', 'Benítez, Beto')).toHaveValue('8');
  });

  it('after the exam each goal shows whether it was met; a student who did not attend says so', async () => {
    renderPage();
    await screen.findByRole('table', { name: 'Metas del grupo' });
    fireEvent.change(screen.getByLabelText('Simulacro'), { target: { value: '1' } });
    await waitFor(() => expect(goalInput('Lectura', 'Arias, Ana')).toHaveValue('9'));
    const table = screen.getByRole('table', { name: 'Metas del grupo' });
    expect(within(table).getByText('Lograda')).toBeInTheDocument();
    expect(within(table).getByText('No lograda')).toBeInTheDocument();
    expect(within(table).getByText('No asistió')).toBeInTheDocument();
  });

  it('an admin picks the tutor', async () => {
    roles = ['ADMIN'];
    renderPage();
    await screen.findByRole('table', { name: 'Metas del grupo' });
    // every tutor's students: each row says whose
    expect(within(screen.getByRole('table', { name: 'Metas del grupo' })).getAllByText('Valle Gómez, Silvia')).toHaveLength(3);
    fireEvent.change(await screen.findByLabelText('Tutor'), { target: { value: '51' } });
    await waitFor(() => expect(new URL(sheetRequests().at(-1).url).searchParams.get('tutorId')).toBe('51'));
  });

  it('a coordinator does not get it', async () => {
    roles = ['COORDINADOR'];
    renderPage();
    expect(await screen.findByText('Las metas son solo para administradores y tutores.')).toBeInTheDocument();
  });

  it("the student's file shows their goals and how they went", async () => {
    renderWithStore(<StudentGoals studentId={5} />);
    const table = await screen.findByRole('table', { name: 'Metas por área' });
    const rows = within(table).getAllByRole('row').slice(1).map((r) => [...r.children].map((c) => c.textContent));
    expect(rows).toEqual([
      ['Lectura', 'Regular 1 · 07 mar', '9', '10', 'Sí'],
      ['Matemáticas', 'Regular 1 · 07 mar', '6', '5', 'No'],
      ['Lectura', 'Regular 3 · 21 mar', '13', '—', 'Pendiente'],
    ]);
  });
});
