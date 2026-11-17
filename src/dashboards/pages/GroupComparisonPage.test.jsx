import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ThemeProvider } from '@mui/material/styles';
import { NotificationProvider } from '../../app/notifications';
import { makeStore } from '../../app/store';
import { theme } from '../../app/theme';
import GroupComparisonPage from './GroupComparisonPage';

const TYPES = [
  { id: 1, name: 'Ciencias' },
  { id: 2, name: 'Letras' },
];
// invented people
const USERS = [
  { id: 50, firstName: 'María', lastNamePat: 'Ríos', lastNameMat: 'Paredes', roles: ['TUTOR'], active: true },
  { id: 51, firstName: 'Julia', lastNamePat: 'Vargas', lastNameMat: null, roles: ['TUTOR'], active: false },
  { id: 9, firstName: 'A', lastNamePat: 'B', lastNameMat: null, roles: ['ADMIN'], active: true },
];
const area = (areaId, areaName, correct, wrong) => ({
  areaId,
  areaName,
  correctAvg: correct[0],
  correctMin: correct[1],
  correctMax: correct[2],
  wrongAvg: wrong[0],
  wrongMin: wrong[1],
  wrongMax: wrong[2],
});
// Regular 2 improved in Lectura, got worse in Matemática and did not evaluate Estadística
const EXAMS = [
  {
    examId: 1001,
    examName: 'Regular 1',
    examDate: '2026-03-14',
    students: 3,
    areas: [area(1, 'Lectura', [15, 10, 20], [7, 5, 10]), area(2, 'Matemática', [11, 5, 18], [10.33, 10, 11])],
    courses: [
      { courseId: 1, courseName: 'Lectura', correctAvg: 15 },
      { courseId: 3, courseName: 'Álgebra', correctAvg: 6.67 },
      { courseId: 6, courseName: 'Estadística', correctAvg: 2 },
    ],
  },
  {
    examId: 1002,
    examName: 'Regular 2',
    examDate: '2026-03-21',
    students: 1,
    areas: [area(1, 'Lectura', [19.5, 12, 26], [5, 2, 8]), area(2, 'Matemática', [9, 0, 24], [12, 2, 14])],
    courses: [
      { courseId: 1, courseName: 'Lectura', correctAvg: 19.5 },
      { courseId: 3, courseName: 'Álgebra', correctAvg: 6.67 },
    ],
  },
];

function json(status, body) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}

let fetchMock;
let roles;
let exams;

function route(request) {
  const url = new URL(request.url);
  if (url.pathname.endsWith('/auth/me')) return json(200, { id: 9, firstName: 'A', lastName: 'B', roles });
  if (url.pathname.endsWith('/exam-types')) return json(200, TYPES);
  if (url.pathname.endsWith('/users')) return json(200, USERS);
  if (url.pathname.endsWith('/group-comparison')) return json(200, exams);
  return json(404, { detail: 'No encontrado.' });
}

function renderPage() {
  const router = createMemoryRouter([{ path: '/group-comparison', element: <GroupComparisonPage /> }], {
    initialEntries: ['/group-comparison'],
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

const groupRequests = () =>
  fetchMock.mock.calls.map(([r]) => new URL(r.url)).filter((url) => url.pathname.endsWith('/group-comparison'));
const rowsOf = (table) => within(table).getAllByRole('row').map((row) => [...row.children].map((c) => c.textContent));

describe('Charla de notas', () => {
  beforeEach(() => {
    roles = ['ADMIN'];
    exams = EXAMS;
    fetchMock = vi.fn((request) => Promise.resolve(route(request)));
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => vi.unstubAllGlobals());

  it('shows the group per exam: average, lowest and highest per area, and the course averages', async () => {
    renderPage();

    const table = await screen.findByRole('table', { name: 'Charla de notas' });
    expect(rowsOf(table)).toEqual([
      ['Área / estadístico', 'Regular 1 · 14 mar3 alumnos', 'Regular 2 · 21 mar1 alumno'],
      ['Buenas', 'Malas', 'Buenas', 'Malas'],
      ['Lectura'],
      // against the previous exam: more correct and fewer wrong answers
      ['Promedio', '15', '7', '19.5 ▲', '5 ▼'],
      ['Mínimo', '10', '5', '12', '2'],
      ['Máximo', '20', '10', '26', '8'],
      ['Matemática'],
      ['Promedio', '11', '10.33', '9 ▼', '12 ▲'],
      // a zero is a value: it shows as 0
      ['Mínimo', '5', '10', '0', '2'],
      ['Máximo', '18', '11', '24', '14'],
      ['Promedio de buenas por curso'],
      ['Lectura', '15', '', '19.5 ▲', ''],
      // the same average: no arrow
      ['Álgebra', '6.67', '', '6.67', ''],
      // not evaluated in Regular 2: no figure, never a zero
      ['Estadística', '2', '', '—', ''],
    ]);
    // the first exam type by default, the whole academy
    expect(groupRequests()[0].searchParams.get('examTypeId')).toBe('1');
    expect(groupRequests()[0].searchParams.has('tutorId')).toBe(false);
  });

  it('an admin picks another exam type and one active tutor', async () => {
    renderPage();
    await screen.findByRole('table', { name: 'Charla de notas' });

    const tutor = screen.getByLabelText('Tutor');
    // only active tutors, as "Apellidos, Nombres"
    expect(within(tutor).getAllByRole('option').map((o) => o.textContent)).toEqual(['Toda la academia', 'Ríos Paredes, María']);
    fireEvent.change(screen.getByLabelText('Tipo de examen'), { target: { value: '2' } });
    fireEvent.change(tutor, { target: { value: '50' } });

    await waitFor(() => {
      const last = groupRequests().at(-1);
      expect(last.searchParams.get('examTypeId')).toBe('2');
      expect(last.searchParams.get('tutorId')).toBe('50');
    });
  });

  it('a tutor sees their own group, without choosing a tutor', async () => {
    roles = ['TUTOR'];
    renderPage();

    await screen.findByRole('table', { name: 'Charla de notas' });
    expect(screen.queryByLabelText('Tutor')).not.toBeInTheDocument();
    expect(screen.getByText(/de tus alumnos/)).toBeInTheDocument();
    expect(groupRequests().every((url) => !url.searchParams.has('tutorId'))).toBe(true);
    // the users list is an admin's: a tutor never asks for it
    expect(fetchMock.mock.calls.some(([r]) => new URL(r.url).pathname.endsWith('/users'))).toBe(false);
  });

  it('says so when the group has no results', async () => {
    exams = [];
    renderPage();

    expect(await screen.findByText('Aún no hay resultados de este tipo de examen en el ciclo activo.')).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('a coordinator does not get it', async () => {
    roles = ['COORDINADOR'];
    renderPage();

    expect(await screen.findByText('La charla de notas es solo para administradores y tutores.')).toBeInTheDocument();
    expect(groupRequests()).toHaveLength(0);
  });
});
