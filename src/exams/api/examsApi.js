import { baseApi } from '../../app/api/baseApi';

// Exams of a stage (REQ-EXAMS-01). Every role reads; ADMIN and COORDINADOR
// create, edit and delete (soft, only without results). An exam is
// { id, stageId, name, examDate, examTypeId, examTypeName, hasResults }:
// examDate is an ISO date; hasResults locks the type and blocks deleting.
export const examsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // newest date first, the exams of one mock exam together (sorted by the backend)
    getExams: build.query({
      query: (stageId) => ({ url: '/exams', params: { stageId } }),
      providesTags: ['Exam'],
    }),
    // a mock exam: { stageId, name, examDate, examTypeIds } → one exam per type, all or nothing
    createExams: build.mutation({
      query: (body) => ({ url: '/exams', method: 'POST', body }),
      // a stage with exams can no longer be deleted
      invalidatesTags: ['Exam', 'Stage'],
    }),
    updateExam: build.mutation({
      query: ({ id, ...body }) => ({ url: `/exams/${id}`, method: 'PUT', body }),
      invalidatesTags: ['Exam'],
    }),
    deleteExam: build.mutation({
      query: (id) => ({ url: `/exams/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Exam', 'Stage'],
    }),
  }),
});

export const { useGetExamsQuery, useCreateExamsMutation, useUpdateExamMutation, useDeleteExamMutation } = examsApi;
