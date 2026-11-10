import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { Provider } from 'react-redux';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ThemeProvider } from '@mui/material/styles';
import { NotificationProvider } from '../../app/notifications';
import { makeStore } from '../../app/store';
import { theme } from '../../app/theme';
import ExamTypesPanel from './ExamTypesPanel';

const AREAS = [
  { id: 1, name: 'Lectura', abbreviation: 'LECT', active: true },
  { id: 2, name: 'Matemáticas', abbreviation: 'MATE', active: true },
];
const COURSES = [
  { id: 3, areaId: 2, name: 'Álgebra', displayLabel: 'Álgebra (ALG)' },
  { id: 1, areaId: 1, name: 'Lectura', displayLabel: 'Lectura (LECT)' },
];
const EXAM_TYPES = [
  { id: 3, name: 'Arquitectura', active: true, courseIds: [3, 1], courseNames: ['Álgebra', 'Lectura'] },
  { id: 1, name: 'Ciencias', active: true, courseIds: [3], courseNames: ['Álgebra'] },
];

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
  const path = new URL(request.url).pathname;
  if (path.endsWith('/auth/me')) return json(200, { id: 1, firstName: 'A', lastName: 'B', roles });
  if (path.endsWith('/areas')) return json(200, AREAS);
  if (path.endsWith('/courses')) return json(200, COURSES);
  if (path.endsWith('/exam-types') && request.method === 'GET') return json(200, EXAM_TYPES);
  return writeResponse(request);
}

function renderPanel() {
  return render(
    <Provider store={makeStore()}>
      <ThemeProvider theme={theme}>
        <NotificationProvider>
          <ExamTypesPanel />
        </NotificationProvider>
      </ThemeProvider>
    </Provider>,
  );
}

const writes = () => fetchMock.mock.calls.map(([r]) => r).filter((r) => r.method !== 'GET');

describe('ExamTypesPanel', () => {
  beforeEach(() => {
    roles = ['ADMIN'];
    writeResponse = () => json(201, { id: 9, name: 'Nuevo', courseIds: [], courseNames: [] });
    fetchMock = vi.fn((request) => Promise.resolve(route(request)));
    vi.stubGlobal('fetch', fetchMock);
    document.cookie = 'XSRF-TOKEN=csrf-1';
  });

  afterEach(() => vi.unstubAllGlobals());

  it('lists every exam type with the courses it evaluates', async () => {
    renderPanel();

    const courses = await screen.findByLabelText('Cursos de Arquitectura');
    expect(within(courses).getByText('Álgebra')).toBeInTheDocument();
    expect(within(courses).getByText('Lectura')).toBeInTheDocument();
    expect(screen.getByText('2 tipos de examen · orden A–Z')).toBeInTheDocument();
  });

  it('is read-only for roles other than ADMIN', async () => {
    roles = ['TUTOR'];
    renderPanel();

    await screen.findByText('Arquitectura');
    await waitFor(() => expect(fetchMock.mock.calls.some(([r]) => r.url.endsWith('/auth/me'))).toBe(true));
    expect(screen.queryByRole('button', { name: /nuevo tipo de examen/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /editar/i })).not.toBeInTheDocument();
  });

  it('flags an empty name and no courses before calling the backend', async () => {
    renderPanel();
    fireEvent.click((await screen.findAllByRole('button', { name: /nuevo tipo de examen/i }))[0]);

    fireEvent.click(await screen.findByRole('button', { name: 'Crear tipo de examen' }));

    expect(await screen.findByText('El tipo de examen necesita un nombre.')).toBeInTheDocument();
    expect(screen.getByText('Selecciona al menos un curso para este tipo de examen.')).toBeInTheDocument();
    expect(writes()).toHaveLength(0);
  });

  it('creates an exam type with its courses in one request and confirms it', async () => {
    renderPanel();
    fireEvent.click((await screen.findAllByRole('button', { name: /nuevo tipo de examen/i }))[0]);

    fireEvent.change(await screen.findByLabelText(/Nombre/), { target: { value: '  Medicina  ' } });
    fireEvent.click(await screen.findByLabelText('Álgebra (ALG)'));
    fireEvent.click(screen.getByLabelText('Lectura (LECT)'));
    fireEvent.click(screen.getByRole('button', { name: 'Crear tipo de examen' }));

    expect(await screen.findByText('Tipo de examen creado.')).toBeInTheDocument();
    const [request] = writes();
    expect(request.method).toBe('POST');
    expect(request.headers.get('X-XSRF-TOKEN')).toBe('csrf-1');
    expect(await request.json()).toEqual({ name: 'Medicina', courseIds: [3, 1] });
  });

  it('opens an exam type pre-filled and saves name and courses together', async () => {
    writeResponse = () => json(200, EXAM_TYPES[1]);
    renderPanel();

    fireEvent.click(await screen.findByRole('button', { name: 'Editar Ciencias' }));
    expect(await screen.findByLabelText(/Nombre/)).toHaveValue('Ciencias');
    expect(await screen.findByLabelText('Álgebra (ALG)')).toBeChecked();
    expect(screen.getByLabelText('Lectura (LECT)')).not.toBeChecked();

    fireEvent.click(screen.getByLabelText('Lectura (LECT)'));
    fireEvent.click(screen.getByRole('button', { name: 'Guardar' }));

    expect(await screen.findByText('Tipo de examen actualizado.')).toBeInTheDocument();
    const [request] = writes();
    expect(request.method).toBe('PUT');
    expect(new URL(request.url).pathname).toBe('/api/v1/exam-types/1');
    expect(await request.json()).toEqual({ name: 'Ciencias', courseIds: [3, 1] });
  });

  it('keeps the form open with the backend message on a duplicate name', async () => {
    writeResponse = () => json(409, { status: 409, detail: 'Ya existe un tipo de examen con ese nombre.' });
    renderPanel();
    fireEvent.click((await screen.findAllByRole('button', { name: /nuevo tipo de examen/i }))[0]);

    fireEvent.change(await screen.findByLabelText(/Nombre/), { target: { value: 'ciencias' } });
    fireEvent.click(await screen.findByLabelText('Álgebra (ALG)'));
    fireEvent.click(screen.getByRole('button', { name: 'Crear tipo de examen' }));

    expect(await screen.findByText('Ya existe un tipo de examen con ese nombre.')).toBeInTheDocument();
    expect(screen.getByLabelText(/Nombre/)).toHaveValue('ciencias');
    expect(screen.getByRole('button', { name: 'Crear tipo de examen' })).toBeInTheDocument();
  });
});
