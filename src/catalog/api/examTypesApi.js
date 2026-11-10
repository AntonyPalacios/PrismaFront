import { baseApi } from '../../app/api/baseApi';

// Exam types are managed by an admin: name + courses saved in one request,
// courses fully replaced, never deactivated (project agreement, 2026-11-10).
export const examTypesApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // [{ id, name, active, courseIds, courseNames }], A–Z, courses A–Z
    getExamTypes: build.query({
      query: () => '/exam-types',
      providesTags: ['ExamType'],
    }),
    createExamType: build.mutation({
      query: (body) => ({ url: '/exam-types', method: 'POST', body }),
      invalidatesTags: ['ExamType'],
    }),
    updateExamType: build.mutation({
      query: ({ id, ...body }) => ({ url: `/exam-types/${id}`, method: 'PUT', body }),
      invalidatesTags: ['ExamType'],
    }),
  }),
});

export const { useGetExamTypesQuery, useCreateExamTypeMutation, useUpdateExamTypeMutation } = examTypesApi;
