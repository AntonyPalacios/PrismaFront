import { baseApi } from '../../app/api/baseApi';

// Students (REQ-STUDENTS-01, -04). Every role reads and searches, inactive
// ones included on request; ADMIN and TUTOR register; ADMIN or the student's
// current tutor edit; only ADMIN
// retires (deactivates) and reactivates. A student is
// { id, firstName, lastNamePat, lastNameMat, dni, email, phone, birthDate, active,
//   currentStageName, tutorId, tutorName } (everything but the names and
// active may be null; birthDate is an ISO date; the last three come from the
// student's current enrollment: the stage in force of the active cycle).
export const studentsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // sorted by surnames (by the backend); `search` filters by name or DNI;
    // inactive students only with `includeInactive`. Only ADMIN sends
    // `tutorId` or `withoutTutor`; a TUTOR always gets just their own students.
    getStudents: build.query({
      query: ({ search = '', includeInactive = false, tutorId = null, withoutTutor = false } = {}) => ({
        url: '/students',
        params: {
          ...(search ? { search } : {}),
          ...(includeInactive ? { includeInactive } : {}),
          ...(tutorId ? { tutorId } : {}),
          ...(withoutTutor ? { withoutTutor } : {}),
        },
      }),
      providesTags: ['Student'],
    }),
    getStudent: build.query({
      query: (id) => `/students/${id}`,
      providesTags: ['Student'],
    }),
    createStudent: build.mutation({
      query: (body) => ({ url: '/students', method: 'POST', body }),
      invalidatesTags: ['Student'],
    }),
    updateStudent: build.mutation({
      query: ({ id, ...body }) => ({ url: `/students/${id}`, method: 'PUT', body }),
      invalidatesTags: ['Student'],
    }),
    deactivateStudent: build.mutation({
      query: (id) => ({ url: `/students/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Student'],
    }),
    reactivateStudent: build.mutation({
      query: (id) => ({ url: `/students/${id}/reactivate`, method: 'POST' }),
      invalidatesTags: ['Student'],
    }),
  }),
});

export const {
  useGetStudentsQuery,
  useGetStudentQuery,
  useCreateStudentMutation,
  useUpdateStudentMutation,
  useDeactivateStudentMutation,
  useReactivateStudentMutation,
} = studentsApi;
