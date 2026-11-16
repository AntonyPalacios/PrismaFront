import { baseApi } from '../../app/api/baseApi';

// Imports through a review batch (REQ-IMPORTS-01): students from the
// template (REQ-IMPORTS-02, ADMIN and TUTOR) and an exam's results from the
// academy's Excel (REQ-EXAMS-02, the three roles). A batch is
// { id, type: 'STUDENTS' | 'EXAM_RESULTS', status, fileName, stageId,
//   stageLabel, examId, examLabel, uploadedAt, totalRows, newRows,
//   matchedRows, unresolvedRows, ignoredRows, skippedRows, rows } and a row
// { id, rowNumber, status, fullName, dni, email, phone, birthDate, careerText,
//   careerName, tutorText, tutorName, notice, student, candidates, enrolls,
//   newStudent, result } where student and candidates are
// { id, fullName, dni, active }. Results rows bring `result`
// { attended, totalCorrect, totalWrong, totalScore, areas: [{ areaName, score }] },
// `enrolls` (confirming enrolls the student in the stage), `newStudent`
// { firstName, lastNamePat, lastNameMat } once registered as new, and in
// `tutorName` the tutor the student will have in the stage: the one they
// already have, else the one the file's TUTOR column (`tutorText`) names.
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
    // { examId, file } → the pending batch of that exam's results; nothing real is written yet
    uploadExamResults: build.mutation({
      query: ({ examId, file }) => {
        const body = new FormData();
        body.append('file', file, file.name);
        return { url: `/exams/${examId}/results/import`, method: 'POST', body };
      },
      invalidatesTags: ['ImportBatch'],
    }),
    // { action: 'MATCH' | 'NEW' | 'IGNORE', studentId?, newStudent? } — a new
    // student of a results batch brings its names split by hand
    resolveImportRow: build.mutation({
      query: ({ batchId, rowId, action, studentId = null, newStudent = null }) => ({
        url: `/import-batches/${batchId}/rows/${rowId}`,
        method: 'PUT',
        body: { action, studentId, ...(newStudent ?? {}) },
      }),
      invalidatesTags: ['ImportBatch'],
    }),
    confirmImportBatch: build.mutation({
      query: (id) => ({ url: `/import-batches/${id}/confirm`, method: 'POST' }),
      // students registered, enrolled and given tutors; an exam gets its results
      invalidatesTags: ['ImportBatch', 'Student', 'Enrollment', 'TutorAssignment', 'Exam'],
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
  useUploadExamResultsMutation,
  useResolveImportRowMutation,
  useConfirmImportBatchMutation,
  useDiscardImportBatchMutation,
  useSearchImportStudentsQuery,
} = importsApi;
