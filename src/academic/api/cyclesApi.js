import { baseApi } from '../../app/api/baseApi';

// Academic cycles (REQ-ACADEMIC-01). Everyone reads; ADMIN creates and edits.
// A cycle created by mistake can be deleted (soft delete) while it has no stages.
// A cycle is { id, name, startDate, endDate, status } with ISO dates
// ("2026-03-01", endDate may be null) and status PLANNED | ACTIVE | CLOSED.
export const cyclesApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // most recent first (sorted by the backend)
    getCycles: build.query({
      query: () => '/cycles',
      providesTags: ['Cycle', 'CycleList'],
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
    // forward only: PLANNED → ACTIVE → CLOSED. `confirm: true` accepts closing
    // before the end date (the backend then moves the end date to today)
    changeCycleStatus: build.mutation({
      query: ({ id, status, confirm = false }) => ({ url: `/cycles/${id}/status`, method: 'PATCH', body: { status, confirm } }),
      invalidatesTags: ['Cycle'],
    }),
    // soft delete, for a cycle created by mistake; 409 if it has stages
    deleteCycle: build.mutation({
      query: (id) => ({ url: `/cycles/${id}`, method: 'DELETE' }),
      // only the list: the detail of a deleted cycle must not be refetched (it would 404)
      invalidatesTags: ['CycleList'],
    }),
  }),
});

export const {
  useDeleteCycleMutation,
  useGetCyclesQuery,
  useGetCycleQuery,
  useCreateCycleMutation,
  useUpdateCycleMutation,
  useChangeCycleStatusMutation,
} = cyclesApi;
