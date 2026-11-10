import { baseApi } from '../../app/api/baseApi';

// Careers: ADMIN creates, edits (incl. exam type), deactivates (soft-delete)
// and reactivates; everyone reads (project agreement, 2026-11-10).
export const careersApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // [{ id, name, abbreviation, active, examTypeId, examTypeName }], A–Z, active and inactive
    getCareers: build.query({
      query: () => '/careers',
      providesTags: ['Career'],
    }),
    createCareer: build.mutation({
      query: (body) => ({ url: '/careers', method: 'POST', body }),
      invalidatesTags: ['Career'],
    }),
    updateCareer: build.mutation({
      query: ({ id, ...body }) => ({ url: `/careers/${id}`, method: 'PUT', body }),
      invalidatesTags: ['Career'],
    }),
    deactivateCareer: build.mutation({
      query: (id) => ({ url: `/careers/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Career'],
    }),
    reactivateCareer: build.mutation({
      query: (id) => ({ url: `/careers/${id}/reactivate`, method: 'POST' }),
      invalidatesTags: ['Career'],
    }),
  }),
});

export const {
  useGetCareersQuery,
  useCreateCareerMutation,
  useUpdateCareerMutation,
  useDeactivateCareerMutation,
  useReactivateCareerMutation,
} = careersApi;
