import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { markSessionExpired } from '../session';

const SAFE_METHODS = ['GET', 'HEAD', 'OPTIONS'];

/** Reads a cookie the backend set as readable by JavaScript (only XSRF-TOKEN is). */
export function readCookie(name) {
  const match = document.cookie.split('; ').find((c) => c.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.split('=').slice(1).join('=')) : null;
}

const rawBaseQuery = fetchBaseQuery({
  // Absolute on the page's own origin (same as '/api/v1' in a browser, but
  // also valid where Request needs a full URL, e.g. tests).
  baseUrl: `${window.location.origin}/api/v1`,
  // The JWT lives in an httpOnly cookie: we never read it, we just let the
  // browser send it. Same-origin thanks to the Vite proxy / prod deploy.
  credentials: 'include',
  prepareHeaders: (headers, { arg }) => {
    const method = (typeof arg === 'string' ? 'GET' : arg.method ?? 'GET').toUpperCase();
    if (!SAFE_METHODS.includes(method)) {
      // CSRF double-submit: echo the XSRF-TOKEN cookie as a header.
      const token = readCookie('XSRF-TOKEN');
      if (token) headers.set('X-XSRF-TOKEN', token);
    }
    return headers;
  },
});

function hadSession(state) {
  return Object.values(state.api?.queries ?? {}).some((q) => q?.endpointName === 'getMe' && q.data);
}

/**
 * Every request goes through here. On a 401 the session is gone: we drop
 * the whole RTK Query cache (the only place the session lives), and
 * PrivateRoute sends the user to /login when getMe fails again.
 * The "your session expired" notice only shows if the user actually had a
 * session — a first visit to a private URL just lands on the login page.
 */
export async function baseQuery(args, api, extraOptions) {
  const result = await rawBaseQuery(args, api, extraOptions);
  if (result.error?.status === 401) {
    const expired = api.endpoint !== 'getMe' || hadSession(api.getState());
    if (expired) markSessionExpired();
    // imported lazily to avoid a circular import (baseApi -> baseQuery)
    const { baseApi } = await import('./baseApi');
    if (expired) api.dispatch(baseApi.util.resetApiState());
  }
  return result;
}
