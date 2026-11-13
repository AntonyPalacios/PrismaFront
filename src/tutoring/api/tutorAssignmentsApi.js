import { baseApi } from '../../app/api/baseApi';

// Tutor of an enrollment, with history (REQ-TUTORING-01). ADMIN and TUTOR
// read; only ADMIN assigns. An assignment is
// { id, enrollmentId, tutorId, tutorName, validFrom, validTo } with ISO
// date-times; validTo null = the current tutor.
export const tutorAssignmentsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // newest first (sorted by the backend)
    getTutorAssignments: build.query({
      query: (enrollmentId) => `/enrollments/${enrollmentId}/tutor-assignments`,
      providesTags: ['TutorAssignment'],
    }),
    // closes the current assignment and opens one; the same tutor again changes nothing
    assignTutor: build.mutation({
      query: ({ enrollmentId, tutorUserId }) => ({
        url: `/enrollments/${enrollmentId}/tutor-assignments`,
        method: 'POST',
        body: { tutorUserId },
      }),
      // the enrollment list shows the current tutor
      invalidatesTags: ['TutorAssignment', 'Enrollment'],
    }),
  }),
});

export const { useGetTutorAssignmentsQuery, useAssignTutorMutation } = tutorAssignmentsApi;
