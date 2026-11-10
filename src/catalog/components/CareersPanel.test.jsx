import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { Provider } from 'react-redux';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ThemeProvider } from '@mui/material/styles';
import { NotificationProvider } from '../../app/notifications';
import { makeStore } from '../../app/store';
import { theme } from '../../app/theme';
import CareersPanel from './CareersPanel';

const EXAM_TYPES = [
  { id: 3, name: 'Arquitectura', active: true, courseIds: [], courseNames: [] },
  { id: 1, name: 'Ciencias', active: true, courseIds: [], courseNames: [] },
];
const CAREERS = [
  { id: 6, name: 'Artes', abbreviation: 'A', active: false, examTypeId: 2, examTypeName: 'Letras' },
  { id: 4, name: 'Biomédica', abbreviation: 'B', active: true, examTypeId: 1, examTypeName: 'Ciencias' },
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
  if (path.endsWith('/exam-types')) return json(200, EXAM_TYPES);
  if (path.endsWith('/careers') && request.method === 'GET') return json(200, CAREERS);
  return writeResponse(request);
}

function renderPanel() {
  return render(
    <Provider store={makeStore()}>
      <ThemeProvider theme={theme}>
        <NotificationProvider>
          <CareersPanel />
        </NotificationProvider>
      </ThemeProvider>
    </Provider>,
  );
}

const writes = () => fetchMock.mock.calls.map(([r]) => r).filter((r) => r.method !== 'GET');

async function chooseExamType(name) {
  fireEvent.mouseDown(await screen.findByRole('combobox', { name: /Tipo de examen/ }));
  fireEvent.click(await screen.findByRole('option', { name }));
}

describe('CareersPanel', () => {
  beforeEach(() => {
    roles = ['ADMIN'];
    writeResponse = () => json(201, CAREERS[1]);
    fetchMock = vi.fn((request) => Promise.resolve(route(request)));
    vi.stubGlobal('fetch', fetchMock);
    document.cookie = 'XSRF-TOKEN=csrf-1';
  });

  afterEach(() => vi.unstubAllGlobals());

  it('lists careers with abbreviation, exam type and status', async () => {
    renderPanel();

    const biomedica = (await screen.findByText('Biomédica')).closest('li');
    expect(within(biomedica).getByText('B · Ciencias')).toBeInTheDocument();
    expect(within(biomedica).getByText('Activa')).toBeInTheDocument();
    const artes = screen.getByText('Artes').closest('li');
    expect(within(artes).getByText('Inactiva')).toBeInTheDocument();
    expect(screen.getByText('2 carreras · orden A–Z')).toBeInTheDocument();
  });

  it('is read-only for roles other than ADMIN', async () => {
    roles = ['COORDINADOR'];
    renderPanel();

    await screen.findByText('Biomédica');
    await waitFor(() => expect(fetchMock.mock.calls.some(([r]) => r.url.endsWith('/auth/me'))).toBe(true));
    expect(screen.queryByRole('button', { name: /nueva carrera/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /editar|reactivar/i })).not.toBeInTheDocument();
  });

  it('flags missing name and exam type before calling the backend', async () => {
    renderPanel();
    fireEvent.click((await screen.findAllByRole('button', { name: /nueva carrera/i }))[0]);

    fireEvent.click(await screen.findByRole('button', { name: 'Crear carrera' }));

    expect(await screen.findByText('La carrera necesita un nombre.')).toBeInTheDocument();
    expect(screen.getByText('Selecciona el tipo de examen de la carrera.')).toBeInTheDocument();
    expect(writes()).toHaveLength(0);
  });

  it('creates a career with its exam type', async () => {
    renderPanel();
    fireEvent.click((await screen.findAllByRole('button', { name: /nueva carrera/i }))[0]);

    fireEvent.change(await screen.findByLabelText(/Nombre/), { target: { value: 'Ingeniería' } });
    await chooseExamType('Ciencias');
    fireEvent.click(screen.getByRole('button', { name: 'Crear carrera' }));

    expect(await screen.findByText('Carrera creada.')).toBeInTheDocument();
    const [request] = writes();
    expect(request.method).toBe('POST');
    expect(request.headers.get('X-XSRF-TOKEN')).toBe('csrf-1');
    expect(await request.json()).toEqual({ name: 'Ingeniería', abbreviation: null, examTypeId: 1 });
  });

  it('edits an active career pre-filled, including its exam type', async () => {
    writeResponse = () => json(200, CAREERS[1]);
    renderPanel();

    fireEvent.click(await screen.findByRole('button', { name: 'Editar Biomédica' }));
    expect(await screen.findByLabelText(/Nombre/)).toHaveValue('Biomédica');
    expect(screen.getByLabelText(/Abreviatura/)).toHaveValue('B');
    await chooseExamType('Arquitectura');
    fireEvent.click(screen.getByRole('button', { name: 'Guardar' }));

    expect(await screen.findByText('Carrera actualizada.')).toBeInTheDocument();
    const [request] = writes();
    expect(request.method).toBe('PUT');
    expect(new URL(request.url).pathname).toBe('/api/v1/careers/4');
    expect(await request.json()).toEqual({ name: 'Biomédica', abbreviation: 'B', examTypeId: 3 });
  });

  it('keeps the form open with the backend message on a duplicate name', async () => {
    writeResponse = () => json(409, { status: 409, detail: 'Ya existe una carrera con ese nombre.' });
    renderPanel();
    fireEvent.click((await screen.findAllByRole('button', { name: /nueva carrera/i }))[0]);

    fireEvent.change(await screen.findByLabelText(/Nombre/), { target: { value: 'biomédica' } });
    await chooseExamType('Ciencias');
    fireEvent.click(screen.getByRole('button', { name: 'Crear carrera' }));

    expect(await screen.findByText('Ya existe una carrera con ese nombre.')).toBeInTheDocument();
    expect(screen.getByLabelText(/Nombre/)).toHaveValue('biomédica');
  });

  it('deactivates a career only after confirming', async () => {
    writeResponse = () => new Response(null, { status: 204 });
    renderPanel();

    fireEvent.click(await screen.findByRole('button', { name: 'Editar Biomédica' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Desactivar carrera' }));
    expect(writes()).toHaveLength(0);

    const dialog = await screen.findByRole('dialog', { name: '¿Desactivar carrera?' });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Desactivar' }));

    expect(await screen.findByText('Carrera desactivada.')).toBeInTheDocument();
    const [request] = writes();
    expect(request.method).toBe('DELETE');
    expect(new URL(request.url).pathname).toBe('/api/v1/careers/4');
  });

  it('reactivates an inactive career after confirming', async () => {
    writeResponse = () => json(200, { ...CAREERS[0], active: true });
    renderPanel();

    expect(await screen.findByText('Artes')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Editar Artes' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Reactivar Artes' }));

    const dialog = await screen.findByRole('dialog', { name: '¿Reactivar carrera?' });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Reactivar' }));

    expect(await screen.findByText('Carrera reactivada.')).toBeInTheDocument();
    const [request] = writes();
    expect(request.method).toBe('POST');
    expect(new URL(request.url).pathname).toBe('/api/v1/careers/6/reactivate');
  });
});
