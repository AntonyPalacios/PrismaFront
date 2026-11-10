import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { makeStore } from '../store';
import { authApi } from '../../users/api/authApi';
import { consumeSessionExpired } from '../session';

function jsonResponse(status, body) {
  return new Response(body === undefined ? null : JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

const ME = { id: 1, email: 'a@b.pe', firstName: 'Antony', lastName: 'Palacios Coronado', roles: ['ADMIN'] };

describe('baseQuery', () => {
  let fetchMock;

  beforeEach(() => {
    fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    document.cookie = 'XSRF-TOKEN=csrf-123';
    sessionStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    document.cookie = 'XSRF-TOKEN=; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  });

  it('echoes the XSRF-TOKEN cookie as a header on mutations', async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 204 }));
    const store = makeStore();

    await store.dispatch(authApi.endpoints.logout.initiate());

    const request = fetchMock.mock.calls[0][0];
    expect(request.method).toBe('POST');
    expect(request.headers.get('X-XSRF-TOKEN')).toBe('csrf-123');
  });

  it('does not send the CSRF header on reads', async () => {
    fetchMock.mockResolvedValue(jsonResponse(200, ME));
    const store = makeStore();

    await store.dispatch(authApi.endpoints.getMe.initiate());

    expect(fetchMock.mock.calls[0][0].headers.has('X-XSRF-TOKEN')).toBe(false);
  });

  it('a first visit without session is not reported as an expired session', async () => {
    fetchMock.mockResolvedValue(jsonResponse(401, { status: 401 }));
    const store = makeStore();

    const result = await store.dispatch(authApi.endpoints.getMe.initiate());

    expect(result.error.status).toBe(401);
    expect(consumeSessionExpired()).toBe(false);
  });

  it('a 401 after having a session clears the cache and flags the expiry', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(200, ME));
    const store = makeStore();
    await store.dispatch(authApi.endpoints.getMe.initiate());
    expect(authApi.endpoints.getMe.select()(store.getState()).data).toEqual(ME);

    fetchMock.mockResolvedValueOnce(jsonResponse(401, { status: 401 }));
    await store.dispatch(authApi.endpoints.getMe.initiate(undefined, { forceRefetch: true }));

    expect(consumeSessionExpired()).toBe(true);
    expect(authApi.endpoints.getMe.select()(store.getState()).data).toBeUndefined();
  });
});
