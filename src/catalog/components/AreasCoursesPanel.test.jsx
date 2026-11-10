import { render, screen, within } from '@testing-library/react';
import { Provider } from 'react-redux';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ThemeProvider } from '@mui/material/styles';
import { makeStore } from '../../app/store';
import { theme } from '../../app/theme';
import { groupCoursesByArea } from '../api/catalogApi';
import AreasCoursesPanel from './AreasCoursesPanel';

const AREAS = [
  { id: 1, name: 'Lectura', abbreviation: 'LECT', active: true },
  { id: 2, name: 'Matemáticas', abbreviation: 'MATE', active: true },
];
const COURSES = [
  { id: 3, areaId: 2, name: 'Álgebra', displayLabel: 'Álgebra (ALG)' },
  { id: 4, areaId: 2, name: 'Geometría', displayLabel: 'Geometría (GEO)' },
  { id: 1, areaId: 1, name: 'Lectura', displayLabel: 'Lectura (LECT)' },
];

function json(status, body) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}

function renderPage() {
  return render(
    <Provider store={makeStore()}>
      <ThemeProvider theme={theme}>
        <AreasCoursesPanel />
      </ThemeProvider>
    </Provider>,
  );
}

describe('groupCoursesByArea', () => {
  it('keeps backend order and puts each course under its area', () => {
    const groups = groupCoursesByArea(AREAS, COURSES);
    expect(groups.map((g) => g.name)).toEqual(['Lectura', 'Matemáticas']);
    expect(groups[1].courses.map((c) => c.name)).toEqual(['Álgebra', 'Geometría']);
    expect(groups[0].courses.map((c) => c.name)).toEqual(['Lectura']);
  });

  it('handles data that has not loaded yet', () => {
    expect(groupCoursesByArea(undefined, undefined)).toEqual([]);
  });
});

describe('AreasCoursesPanel', () => {
  let fetchMock;

  beforeEach(() => {
    fetchMock = vi.fn((request) =>
      Promise.resolve(request.url.endsWith('/areas') ? json(200, AREAS) : json(200, COURSES)),
    );
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => vi.unstubAllGlobals());

  it('shows every area with its courses, read-only', async () => {
    renderPage();

    const math = await screen.findByRole('region', { name: /Matemáticas/ });
    expect(within(math).getByText('Álgebra (ALG)')).toBeInTheDocument();
    expect(within(math).getByText('Geometría (GEO)')).toBeInTheDocument();
    expect(within(math).getByText('2 cursos · orden A–Z')).toBeInTheDocument();

    const reading = screen.getByRole('region', { name: /Lectura/ });
    expect(within(reading).getByText('Lectura (LECT)')).toBeInTheDocument();

    // fixed data: nothing to create, edit or deactivate
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('shows the backend message when the catalog cannot be loaded', async () => {
    fetchMock.mockImplementation(() =>
      Promise.resolve(json(500, { status: 500, detail: 'Ocurrió un problema inesperado. Código X.' })),
    );

    renderPage();

    expect(await screen.findByRole('alert')).toHaveTextContent('Ocurrió un problema inesperado. Código X.');
  });
});
