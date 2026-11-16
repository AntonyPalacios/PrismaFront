import { baseApi } from '../../app/api/baseApi';

// Importing students from the template through a review batch
// (REQ-IMPORTS-02, REQ-IMPORTS-01). ADMIN and TUTOR only. A batch is
// { id, type, status, fileName, stageId, stageLabel, uploadedAt, totalRows,
//   newRows, matchedRows, unresolvedRows, ignoredRows, rows } and a row
// { id, rowNumber, status, fullName, dni, email, phone, birthDate, careerText,
//   careerName, tutorText, tutorName, notice, student, candidates } where
// student and candidates are { id, fullName, dni, active }.
// The template downloads straight from TEMPLATE_URL (same origin, with the
// session cookie): a file is not something to keep in the cache.
export const TEMPLATE_URL = '/api/v1/student-imports/template';

export const importsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // newest first, without their rows
    getImportBatches: build.query({
      query: (status) => ({ url: '/import-batches', params: status ? { status } : undefined }),
      providesTags: ['ImportBatch'],
    }),
    getImportBatch: build.query({
      query: (id) => `/import-batches/${id}`,
      providesTags: ['ImportBatch'],
    }),
    // { file, stageId? } → the pending batch; nothing real is written yet
    uploadStudents: build.mutation({
      query: ({ file, stageId }) => {
        const body = new FormData();
        body.append('file', file, file.name); // the name is shown in "Importaciones"
        return { url: '/student-imports', method: 'POST', body, params: stageId ? { stageId } : undefined };
      },
      invalidatesTags: ['ImportBatch'],
    }),
    // { action: 'MATCH' | 'NEW' | 'IGNORE', studentId? }
    resolveImportRow: build.mutation({
      query: ({ batchId, rowId, action, studentId = null }) => ({
        url: `/import-batches/${batchId}/rows/${rowId}`,
        method: 'PUT',
        body: { action, studentId },
      }),
      invalidatesTags: ['ImportBatch'],
    }),
    confirmImportBatch: build.mutation({
      query: (id) => ({ url: `/import-batches/${id}/confirm`, method: 'POST' }),
      // students registered, enrolled and given tutors
      invalidatesTags: ['ImportBatch', 'Student', 'Enrollment', 'TutorAssignment'],
    }),
    discardImportBatch: build.mutation({
      query: (id) => ({ url: `/import-batches/${id}/discard`, method: 'POST' }),
      invalidatesTags: ['ImportBatch'],
    }),
    // any registered student by name or DNI, to resolve a row by hand
    searchImportStudents: build.query({
      query: ({ batchId, query }) => ({ url: `/import-batches/${batchId}/student-search`, params: { query } }),
    }),
  }),
});

export const {
  useGetImportBatchesQuery,
  useGetImportBatchQuery,
  useUploadStudentsMutation,
  useResolveImportRowMutation,
  useConfirmImportBatchMutation,
  useDiscardImportBatchMutation,
  useSearchImportStudentsQuery,
} = importsApi;
