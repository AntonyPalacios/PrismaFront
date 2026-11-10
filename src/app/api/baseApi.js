import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from './baseQuery';

/**
 * The single RTK Query API of the app. Each module adds its endpoints with
 * baseApi.injectEndpoints (e.g. users/api/authApi.js), so they all share
 * the same cache, CSRF handling and 401 behavior.
 */
export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery,
  tagTypes: ['Me', 'ExamType', 'Career'],
  endpoints: () => ({}),
});
