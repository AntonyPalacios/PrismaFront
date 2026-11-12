import { baseApi } from '../../app/api/baseApi';

// Academic cycles (REQ-ACADEMIC-01). Everyone reads; ADMIN creates and edits.
// There is no delete: a cycle is closed, never removed.
// A cycle is { id, name, startDate, endDate, status } with ISO dates
// ("2026-03-01", endDate may be null) and status PLANNED | ACTIVE | CLOSED.
export const cyclesApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // most recent first (sorted by the backend)
    getCycles: build.query({
      query: () => '/cycles',
      providesTags: ['Cycle'],
    }),
    getCycle: build.query({
      query: (id) => `/cycles/${id}`,
      providesTags: ['Cycle'],
    }),
    createCycle: build.mutation({
      query: (body) => ({ url: '/cycles', method: 'POST', body }),
      invalidatesTags: ['Cycle'],
    }),
    updateCycle: build.mutation({
      query: ({ id, ...body }) => ({ url: `/cycles/${id}`, method: 'PUT', body }),
      invalidatesTags: ['Cycle'],
    }),
  }),
});

export const { useGetCyclesQuery, useGetCycleQuery, useCreateCycleMutation, useUpdateCycleMutation } = cyclesApi;
