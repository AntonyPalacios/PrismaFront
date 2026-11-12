import { baseApi } from '../../app/api/baseApi';

// Stages of a cycle (REQ-ACADEMIC-02), always reached through their cycle.
// Everyone reads; ADMIN creates, edits and deletes (soft delete; 409 if the
// stage has enrollments or exams).
// A stage is { id, cycleId, name, startDate, endDate, status, current }:
// ISO dates (endDate may be null), status PLANNED | ACTIVE | CLOSED, and
// `current` marks the stage in force by date (unrelated to the status).
export const stagesApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // by start date (sorted by the backend)
    getStages: build.query({
      query: (cycleId) => `/cycles/${cycleId}/stages`,
      providesTags: ['Stage'],
    }),
    createStage: build.mutation({
      query: ({ cycleId, ...body }) => ({ url: `/cycles/${cycleId}/stages`, method: 'POST', body }),
      invalidatesTags: ['Stage'],
    }),
    updateStage: build.mutation({
      query: ({ cycleId, id, ...body }) => ({ url: `/cycles/${cycleId}/stages/${id}`, method: 'PUT', body }),
      invalidatesTags: ['Stage'],
    }),
    deleteStage: build.mutation({
      query: ({ cycleId, id }) => ({ url: `/cycles/${cycleId}/stages/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Stage'],
    }),
    // forward only: PLANNED -> ACTIVE -> CLOSED. No `confirm` here: the backend
    // never changes a stage's end date, so there is nothing to accept
    changeStageStatus: build.mutation({
      query: ({ cycleId, id, status }) => ({ url: `/cycles/${cycleId}/stages/${id}/status`, method: 'PATCH', body: { status } }),
      invalidatesTags: ['Stage'],
    }),
  }),
});

export const {
  useGetStagesQuery,
  useCreateStageMutation,
  useUpdateStageMutation,
  useDeleteStageMutation,
  useChangeStageStatusMutation,
} = stagesApi;
