import { baseApi } from '../../app/api/baseApi';

// Students (REQ-STUDENTS-01, -04). Every role reads and searches, inactive
// ones included on request; ADMIN and TUTOR register and edit; only ADMIN
// retires (deactivates) and reactivates. A student is
// { id, firstName, lastNamePat, lastNameMat, dni, email, phone, birthDate, active }
// (everything but the names may be null; birthDate is an ISO date).
export const studentsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // sorted by surnames (by the backend); `search` filters by name or DNI;
    // inactive students only with `includeInactive`
    getStudents: build.query({
      query: ({ search = '', includeInactive = false } = {}) => ({
        url: '/students',
        params: { ...(search ? { search } : {}), ...(includeInactive ? { includeInactive } : {}) },
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
