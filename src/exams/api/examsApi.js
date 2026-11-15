import { baseApi } from '../../app/api/baseApi';

// Mock exams of a stage and their exam types (REQ-EXAMS-01). Every role
// reads; ADMIN and COORDINADOR create, edit and delete. A mock exam is
// { id, stageId, name, examDate, hasResults, exams } and each of its exams
// { id, examTypeId, examTypeName, hasResults } (catalog order). Name and date
// belong to the mock exam, so editing them applies to every type.
export const examsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // newest date first (sorted by the backend)
    getMockExams: build.query({
      query: (stageId) => ({ url: '/mock-exams', params: { stageId } }),
      providesTags: ['Exam'],
    }),
    // { stageId, name, examDate, examTypeIds } → one exam per type, all or nothing
    createMockExam: build.mutation({
      query: (body) => ({ url: '/mock-exams', method: 'POST', body }),
      // a stage with exams can no longer be deleted
      invalidatesTags: ['Exam', 'Stage'],
    }),
    updateMockExam: build.mutation({
      query: ({ id, ...body }) => ({ url: `/mock-exams/${id}`, method: 'PUT', body }),
      invalidatesTags: ['Exam'],
    }),
    // soft, only while none of its exams has results
    deleteMockExam: build.mutation({
      query: (id) => ({ url: `/mock-exams/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Exam', 'Stage'],
    }),
    addExamType: build.mutation({
      query: ({ mockExamId, examTypeId }) => ({ url: `/mock-exams/${mockExamId}/exams`, method: 'POST', body: { examTypeId } }),
      invalidatesTags: ['Exam'],
    }),
    // only an exam type without results, and never the last one
    removeExamType: build.mutation({
      query: ({ mockExamId, examId }) => ({ url: `/mock-exams/${mockExamId}/exams/${examId}`, method: 'DELETE' }),
      invalidatesTags: ['Exam'],
    }),
  }),
});

export const {
  useGetMockExamsQuery,
  useCreateMockExamMutation,
  useUpdateMockExamMutation,
  useDeleteMockExamMutation,
  useAddExamTypeMutation,
  useRemoveExamTypeMutation,
} = examsApi;
