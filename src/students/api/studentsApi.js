import { baseApi } from '../../app/api/baseApi';

// Students (REQ-STUDENTS-01). Every role reads and searches; ADMIN and TUTOR
// register and edit. A student is
// { id, firstName, lastNamePat, lastNameMat, dni, email, phone, birthDate, active }
// (everything but the names may be null; birthDate is an ISO date).
export const studentsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // active students sorted by surnames (by the backend); `search` filters by name or DNI
    getStudents: build.query({
      query: (search = '') => ({ url: '/students', params: search ? { search } : undefined }),
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
  }),
});

export const { useGetStudentsQuery, useGetStudentQuery, useCreateStudentMutation, useUpdateStudentMutation } = studentsApi;
