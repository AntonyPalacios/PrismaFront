import { baseApi } from '../../app/api/baseApi';

// Enrollments of a student in stages (REQ-STUDENTS-02). Only ADMIN and
// TUTOR, reading included: a COORDINADOR does not see them. An enrollment is
// { id, studentId, cycleId, cycleName, cycleStatus, stageId, stageName,
//   stageStatus, careerId, careerName, active } (career fields null while
// undefined; statuses PLANNED | ACTIVE | CLOSED; active=false = withdrawn).
export const enrollmentsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // the student's whole history, newest stage first (sorted by the backend)
    getEnrollments: build.query({
      query: (studentId) => ({ url: '/enrollments', params: { studentId } }),
      providesTags: ['Enrollment'],
    }),
    createEnrollment: build.mutation({
      query: (body) => ({ url: '/enrollments', method: 'POST', body }),
      // a stage with enrollments can no longer be deleted; the student may now have a current stage
      invalidatesTags: ['Enrollment', 'Stage', 'Student'],
    }),
    // career (null clears it) and, ADMIN only, the tutor (null = unchanged), saved together
    updateEnrollment: build.mutation({
      query: ({ id, careerId, tutorUserId = null }) => ({
        url: `/enrollments/${id}`,
        method: 'PUT',
        body: { careerId, tutorUserId },
      }),
      // a new tutor changes the history and the student's current tutor (list and file)
      invalidatesTags: ['Enrollment', 'TutorAssignment', 'Student'],
    }),
    // mass enrollment (REQ-STUDENTS-05), ADMIN only: the students enrolled in the
    // source stage, by name, as [{ studentId, fullName, careerId, tutorUserId,
    // skipReason }] (skipReason ALREADY_ENROLLED | INACTIVE_STUDENT | null).
    // A POST that only reads, so it is a query
    getBulkEnrollmentPreview: build.query({
      query: ({ sourceStageId, targetStageId }) => ({
        url: '/enrollments/bulk-preview',
        method: 'POST',
        body: { sourceStageId, targetStageId },
      }),
      providesTags: ['Enrollment', 'TutorAssignment', 'Student'],
    }),
    // { targetStageId, rows: [{ studentId, careerId, tutorUserId }] } -> { created, skipped }; all or nothing
    bulkEnroll: build.mutation({
      query: (body) => ({ url: '/enrollments/bulk', method: 'POST', body }),
      invalidatesTags: ['Enrollment', 'TutorAssignment', 'Stage', 'Student'],
    }),
    // withdraw from the stage (soft): the enrollment stays in the history
    withdrawEnrollment: build.mutation({
      query: (id) => ({ url: `/enrollments/${id}`, method: 'DELETE' }),
      // withdrawing also ends the current tutor and the student's current stage
      invalidatesTags: ['Enrollment', 'TutorAssignment', 'Student'],
    }),
  }),
});

export const {
  useGetEnrollmentsQuery,
  useCreateEnrollmentMutation,
  useUpdateEnrollmentMutation,
  useWithdrawEnrollmentMutation,
  useGetBulkEnrollmentPreviewQuery,
  useBulkEnrollMutation,
} = enrollmentsApi;
