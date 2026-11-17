import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { Provider } from 'react-redux';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ThemeProvider } from '@mui/material/styles';
import { todayIso } from '../../academic/cycleDisplay';
import { NotificationProvider } from '../../app/notifications';
import { makeStore } from '../../app/store';
import { theme } from '../../app/theme';
import LogbookSection from './LogbookSection';

const LUCIA = { id: 5, firstName: 'Lucía', lastNamePat: 'Quispe', tutorId: 9, active: true };
const entry = (id, sessionDate, reason, authorName = 'Valle Gómez, Silvia') => ({
  id,
  studentId: 5,
  authorUserId: 9,
  authorName,
  sessionDate,
  createdAt: `${sessionDate}T10:00:00-05:00`,
  reason,
  agreements: 'Repasar',
  observations: null,
});

function json(status, body) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}

let fetchMock;
let me;
let pages;
let writeResponse;

function route(request) {
  const url = new URL(request.url);
  if (url.pathname.endsWith('/auth/me')) return json(200, me);
  if (request.method === 'GET' && url.pathname.endsWith('/students/5/logbook-entries')) {
    return json(200, pages[url.searchParams.get('page')]);
  }
  return writeResponse(request);
}

function renderSection(student = LUCIA) {
  render(
    <Provider store={makeStore()}>
      <ThemeProvider theme={theme}>
        <NotificationProvider>
          <LogbookSection student={student} />
        </NotificationProvider>
      </ThemeProvider>
    </Provider>,
  );
}

const writes = () => fetchMock.mock.calls.map(([r]) => r).filter((r) => r.method !== 'GET');
const entries = () => within(screen.getByRole('list', { name: 'Entradas de la bitácora' }));

describe('Logbook section', () => {
  beforeEach(() => {
    me = { id: 9, firstName: 'Silvia', lastName: 'Valle', roles: ['TUTOR'] };
    pages = {
      0: { entries: [entry(2, '2026-11-10', 'Bajó en Álgebra')], page: 0, size: 20, totalElements: 2, hasMore: true },
      1: { entries: [entry(1, '2025-10-01', 'Ansiedad', 'Salas Ríos, Ruth')], page: 1, size: 20, totalElements: 2, hasMore: false },
    };
    writeResponse = () => json(201, entry(3, todayIso(), 'Seguimiento'));
    fetchMock = vi.fn((request) => Promise.resolve(route(request)));
    vi.stubGlobal('fetch', fetchMock);
    document.cookie = 'XSRF-TOKEN=csrf-1';
  });

  afterEach(() => vi.unstubAllGlobals());

  it('shows the history newest first, 20 at a time, without edit or delete controls', async () => {
    renderSection();
    const first = await screen.findByRole('listitem', { name: /Sesión del 10 nov 2026/ });
    expect(within(first).getByText('Bajó en Álgebra')).toBeInTheDocument();
    expect(within(first).getByText('Valle Gómez, Silvia')).toBeInTheDocument();
    expect(within(first).getByText('—')).toBeInTheDocument(); // empty observations
    expect(screen.queryByRole('button', { name: /editar|borrar|eliminar/i })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Ver más' }));
    // a former tutor's entry is part of the history
    expect(await entries().findByText('Salas Ríos, Ruth')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Ver más' })).not.toBeInTheDocument();
  });

  it('every save warns that the entry cannot be edited or deleted, listing the empty fields', async () => {
    renderSection();
    fireEvent.click(await screen.findByRole('button', { name: 'Nueva entrada' }));
    const form = screen.getByRole('form', { name: 'Nueva entrada de bitácora' });
    expect(within(form).getByLabelText(/Fecha de la sesión/)).toHaveValue(todayIso());
    fireEvent.change(within(form).getByLabelText('Motivo de la sesión'), { target: { value: 'Seguimiento' } });
    fireEvent.change(within(form).getByLabelText('Acuerdos'), { target: { value: 'Mantener el ritmo' } });
    fireEvent.click(within(form).getByRole('button', { name: 'Guardar' }));

    const dialog = await screen.findByRole('dialog', { name: '¿Guardar la entrada?' });
    expect(within(dialog).getByText(/Quedaron vacíos: observaciones\. Después de guardarla no podrás editarla ni borrarla\./)).toBeInTheDocument();
    expect(writes()).toHaveLength(0); // nothing is sent before confirming
    fireEvent.click(within(dialog).getByRole('button', { name: 'Guardar' }));

    expect(await screen.findByText('Entrada registrada en la bitácora.')).toBeInTheDocument();
    const [request] = writes();
    expect(new URL(request.url).pathname).toMatch(/\/students\/5\/logbook-entries$/);
    expect(await request.json()).toEqual({
      sessionDate: todayIso(),
      reason: 'Seguimiento',
      agreements: 'Mantener el ritmo',
      observations: '',
      confirm: true,
    });
    await waitFor(() => expect(screen.queryByRole('form', { name: 'Nueva entrada de bitácora' })).not.toBeInTheDocument());
  });

  it('asks even with every field written; nothing written at all is flagged before the backend', async () => {
    renderSection();
    fireEvent.click(await screen.findByRole('button', { name: 'Nueva entrada' }));
    const form = screen.getByRole('form', { name: 'Nueva entrada de bitácora' });
    fireEvent.click(within(form).getByRole('button', { name: 'Guardar' }));
    expect(await within(form).findByText('Escribe al menos el motivo, los acuerdos o las observaciones.')).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    for (const label of ['Motivo de la sesión', 'Acuerdos', 'Observaciones']) {
      fireEvent.change(within(form).getByLabelText(label), { target: { value: 'algo' } });
    }
    fireEvent.click(within(form).getByRole('button', { name: 'Guardar' }));
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText('Después de guardarla no podrás editarla ni borrarla.')).toBeInTheDocument();
  });

  it('keeps the text when the backend rejects the entry', async () => {
    writeResponse = () => json(403, { detail: 'Solo el tutor actual del alumno puede registrar entradas en su bitácora.' });
    renderSection();
    fireEvent.click(await screen.findByRole('button', { name: 'Nueva entrada' }));
    const form = screen.getByRole('form', { name: 'Nueva entrada de bitácora' });
    fireEvent.change(within(form).getByLabelText('Motivo de la sesión'), { target: { value: 'Seguimiento' } });
    fireEvent.click(within(form).getByRole('button', { name: 'Guardar' }));
    fireEvent.click(within(await screen.findByRole('dialog')).getByRole('button', { name: 'Guardar' }));

    expect(await within(form).findByText(/Solo el tutor actual/)).toBeInTheDocument();
    expect(within(form).getByLabelText('Motivo de la sesión')).toHaveValue('Seguimiento');
  });

  it('an admin who is not the current tutor only reads', async () => {
    me = { id: 1, firstName: 'Antony', lastName: 'Palacios', roles: ['ADMIN'] };
    renderSection();
    await screen.findByText('Bajó en Álgebra');
    expect(screen.queryByRole('button', { name: 'Nueva entrada' })).not.toBeInTheDocument();
  });

  it('an empty logbook says so', async () => {
    pages = { 0: { entries: [], page: 0, size: 20, totalElements: 0, hasMore: false } };
    renderSection();
    expect(await screen.findByText('Aún no hay entradas en la bitácora.')).toBeInTheDocument();
  });
});
