import { configureStore } from '@reduxjs/toolkit';
import { baseApi } from './api/baseApi';

// Server state only lives in RTK Query. Never copy query results into
// another slice (that was v1's two-sources-of-truth bug).
export function makeStore() {
  return configureStore({
    reducer: { [baseApi.reducerPath]: baseApi.reducer },
    middleware: (getDefault) => getDefault().concat(baseApi.middleware),
  });
}

export const store = makeStore();
