import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it } from 'vitest';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from '../../app/theme';
import { markSessionExpired } from '../../app/session';
import LoginPage, { EXPIRED_MESSAGE, GOOGLE_LOGIN_URL } from './LoginPage';

function renderAt(url) {
  return render(
    <ThemeProvider theme={theme}>
      <MemoryRouter initialEntries={[url]}>
        <LoginPage />
      </MemoryRouter>
    </ThemeProvider>,
  );
}

describe('LoginPage', () => {
  beforeEach(() => sessionStorage.clear());

  it('sends the whole page to the backend Google flow', () => {
    renderAt('/login');
    const button = screen.getByRole('link', { name: /continuar con google/i });
    expect(button).toHaveAttribute('href', GOOGLE_LOGIN_URL);
    expect(GOOGLE_LOGIN_URL).toMatch(/\/oauth2\/authorization\/google$/);
  });

  it('explains when the email is not registered', () => {
    renderAt('/login?error=not_registered');
    expect(screen.getByRole('alert')).toHaveTextContent('No tienes una cuenta activa en Prisma');
  });

  it('shows a generic message for other login errors', () => {
    renderAt('/login?error=login_failed');
    expect(screen.getByRole('alert')).toHaveTextContent('No se pudo iniciar sesión con Google');
  });

  it('tells the user their session expired, only once', () => {
    markSessionExpired();
    const { unmount } = renderAt('/login');
    expect(screen.getByRole('alert')).toHaveTextContent(EXPIRED_MESSAGE);
    unmount();

    renderAt('/login');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('shows no alert on a normal visit', () => {
    renderAt('/login');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
