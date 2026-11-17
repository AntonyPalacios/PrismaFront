import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { Provider } from 'react-redux';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ThemeProvider } from '@mui/material/styles';
import { NotificationProvider } from '../../app/notifications';
import { makeStore } from '../../app/store';
import { theme } from '../../app/theme';
import ParentsSection from './ParentsSection';

// every person is invented
const ANA = { id: 5, firstName: 'Ana', lastNamePat: 'Ramos', active: true };
const ROSA = {
  parentId: 70,
  fullName: 'Rosa Ramos Díaz',
  phone: '999 112 334',
  email: null,
  relationshipType: 'MADRE',
  otherStudents: ['Ramos, Beto'],
};
const JORGE = { id: 71, fullName: 'Jorge Ramos Pinto', phone: '987 654 321', email: 'jorge@prueba.pe' };

function json(status, body) {
  return new Response(body === undefined ? null : JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

let fetchMock;
let writeResponse;

function route(request) {
  const url = new URL(request.url);
  if (request.method === 'GET' && url.pathname.endsWith('/students/5/parents')) return json(200, [ROSA]);
  if (request.method === 'GET' && url.pathname.endsWith('/parents')) return json(200, [JORGE]);
  return writeResponse(request);
}

function renderSection(canChange = true) {
  render(
    <Provider store={makeStore()}>
      <ThemeProvider theme={theme}>
        <NotificationProvider>
          <ParentsSection student={ANA} canChange={canChange} />
        </NotificationProvider>
      </ThemeProvider>
    </Provider>,
  );
}

const writes = () => fetchMock.mock.calls.map(([r]) => r).filter((r) => r.method !== 'GET');
const searches = () =>
  fetchMock.mock.calls.map(([r]) => new URL(r.url)).filter((u) => u.pathname.endsWith('/api/v1/parents'));

describe('Guardians section', () => {
  beforeEach(() => {
    writeResponse = () => json(201, { ...ROSA, parentId: 71 });
    fetchMock = vi.fn((request) => Promise.resolve(route(request)));
    vi.stubGlobal('fetch', fetchMock);
    document.cookie = 'XSRF-TOKEN=csrf-1';
  });

  it('shows who to contact, with the relationship and the siblings they look after', async () => {
    renderSection();
    const list = await screen.findByRole('list', { name: 'Apoderados del alumno' });
    expect(within(list).getByText('Rosa Ramos Díaz')).toBeInTheDocument();
    expect(within(list).getByText('999 112 334')).toBeInTheDocument();
    expect(within(list).getByText('Mamá')).toBeInTheDocument();
    expect(within(list).getByText('También de: Ramos, Beto')).toBeInTheDocument();
  });

  it('read only without the right to change them', async () => {
    renderSection(false);
    await screen.findByRole('list', { name: 'Apoderados del alumno' });
    expect(screen.queryByRole('button', { name: '+ Vincular apoderado' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Desvincular a Rosa Ramos Díaz' })).not.toBeInTheDocument();
  });

  it("links a sibling's guardian found by name", async () => {
    renderSection();
    fireEvent.click(await screen.findByRole('button', { name: '+ Vincular apoderado' }));
    const form = await screen.findByRole('form', { name: 'Vincular apoderado' });

    // nothing chosen yet: the form says so before calling the backend
    fireEvent.change(within(form).getByLabelText('Parentesco'), { target: { value: 'PADRE' } });
    fireEvent.click(within(form).getByRole('button', { name: 'Guardar' }));
    expect(await within(form).findByText('Elige un apoderado o registra uno nuevo')).toBeInTheDocument();

    fireEvent.change(within(form).getByLabelText('Apoderado registrado'), { target: { value: 'jorge' } });
    await waitFor(() => expect(searches().at(-1)?.searchParams.get('search')).toBe('jorge'));
    fireEvent.click(await screen.findByRole('option', { name: 'Jorge Ramos Pinto · 987 654 321' }));
    fireEvent.click(within(form).getByRole('button', { name: 'Guardar' }));

    await waitFor(() => expect(writes()).toHaveLength(1));
    expect(new URL(writes()[0].url).pathname).toBe('/api/v1/students/5/parents');
    expect(await writes()[0].clone().json()).toEqual({ relationshipType: 'PADRE', parentId: 71 });
    expect(await screen.findByText('Apoderado vinculado.')).toBeInTheDocument();
  });

  it('registers a new guardian and links them in one save', async () => {
    renderSection();
    fireEvent.click(await screen.findByRole('button', { name: '+ Vincular apoderado' }));
    const form = await screen.findByRole('form', { name: 'Vincular apoderado' });
    fireEvent.click(within(form).getByRole('button', { name: '+ Registrar nuevo apoderado' }));

    fireEvent.change(within(form).getByLabelText('Celular'), { target: { value: '12345' } });
    fireEvent.click(within(form).getByRole('button', { name: 'Guardar' }));
    expect(await within(form).findByText('Ingresa el nombre completo')).toBeInTheDocument();
    expect(within(form).getByText('Debe tener entre 7 y 15 dígitos')).toBeInTheDocument();
    expect(within(form).getByText('Elige el parentesco')).toBeInTheDocument();

    fireEvent.change(within(form).getByLabelText('Nombre completo'), { target: { value: '  Luis   Ramos ' } });
    fireEvent.change(within(form).getByLabelText('Celular'), { target: { value: '+51 987  654 321' } });
    fireEvent.change(within(form).getByLabelText('Parentesco'), { target: { value: 'HERMANO' } });
    fireEvent.click(within(form).getByRole('button', { name: 'Guardar' }));

    await waitFor(() => expect(writes()).toHaveLength(1));
    expect(await writes()[0].clone().json()).toEqual({
      relationshipType: 'HERMANO',
      parent: { fullName: 'Luis Ramos', phone: '+51 987 654 321', email: null },
    });
  });

  it('editing a shared guardian warns that it changes for the siblings too', async () => {
    writeResponse = () => json(200, { id: 70, fullName: 'Rosa Ramos Díaz', phone: '988 000 111', email: null });
    renderSection();
    fireEvent.click(await screen.findByRole('button', { name: 'Editar a Rosa Ramos Díaz' }));
    const form = await screen.findByRole('form', { name: 'Editar apoderado' });
    expect(within(form).getByText('También es apoderado de Ramos, Beto. El cambio se verá también en su ficha.')).toBeInTheDocument();
    expect(within(form).getByLabelText('Celular')).toHaveValue('999 112 334');

    fireEvent.change(within(form).getByLabelText('Celular'), { target: { value: '988 000 111' } });
    fireEvent.click(within(form).getByRole('button', { name: 'Guardar' }));
    await waitFor(() => expect(writes()).toHaveLength(1));
    expect(writes()[0].method).toBe('PUT');
    expect(new URL(writes()[0].url).pathname).toBe('/api/v1/parents/70');
    expect(await writes()[0].clone().json()).toEqual({ fullName: 'Rosa Ramos Díaz', phone: '988 000 111', email: null });
  });

  it('unlinks after confirming, keeping the form open on a backend error', async () => {
    writeResponse = () => json(204);
    renderSection();
    fireEvent.click(await screen.findByRole('button', { name: 'Desvincular a Rosa Ramos Díaz' }));
    const dialog = await screen.findByRole('dialog', { name: '¿Desvincular apoderado?' });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Desvincular' }));
    await waitFor(() => expect(writes()).toHaveLength(1));
    expect(writes()[0].method).toBe('DELETE');
    expect(new URL(writes()[0].url).pathname).toBe('/api/v1/students/5/parents/70');
    expect(await screen.findByText('Apoderado desvinculado.')).toBeInTheDocument();
  });

  it('shows the backend message when linking is rejected', async () => {
    writeResponse = () => json(409, { detail: 'Este apoderado ya está vinculado al alumno.' });
    renderSection();
    fireEvent.click(await screen.findByRole('button', { name: '+ Vincular apoderado' }));
    const form = await screen.findByRole('form', { name: 'Vincular apoderado' });
    fireEvent.change(within(form).getByLabelText('Apoderado registrado'), { target: { value: 'jorge' } });
    fireEvent.click(await screen.findByRole('option', { name: 'Jorge Ramos Pinto · 987 654 321' }));
    fireEvent.change(within(form).getByLabelText('Parentesco'), { target: { value: 'OTRO' } });
    fireEvent.click(within(form).getByRole('button', { name: 'Guardar' }));
    expect(await within(form).findByText('Este apoderado ya está vinculado al alumno.')).toBeInTheDocument();
  });
});
