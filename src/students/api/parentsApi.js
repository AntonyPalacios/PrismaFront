import { baseApi } from '../../app/api/baseApi';

// Guardians (REQ-STUDENTS-03), ADMIN and TUTOR only: a COORDINADOR does not
// see them. A guardian is { id, fullName, phone, email }; a student's
// guardian is { parentId, fullName, phone, email, relationshipType,
// otherStudents } (relationshipType MADRE | PADRE | HERMANO | OTRO;
// otherStudents = the other students they look after, "Apellidos, Nombres").
export const parentsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // by name or phone, at most 20; fewer than 2 characters finds nobody
    searchParents: build.query({
      query: (search) => ({ url: '/parents', params: { search } }),
      providesTags: ['Parent'],
    }),
    getStudentParents: build.query({
      query: (studentId) => `/students/${studentId}/parents`,
      providesTags: ['Parent'],
    }),
    // { studentId, parentId, relationshipType } or { studentId, parent: { fullName, phone, email }, relationshipType }
    linkParent: build.mutation({
      query: ({ studentId, ...body }) => ({ url: `/students/${studentId}/parents`, method: 'POST', body }),
      invalidatesTags: ['Parent'],
    }),
    // contact data, for every student the guardian looks after
    updateParent: build.mutation({
      query: ({ id, ...body }) => ({ url: `/parents/${id}`, method: 'PUT', body }),
      invalidatesTags: ['Parent'],
    }),
    // the guardian stays, with their other students
    unlinkParent: build.mutation({
      query: ({ studentId, parentId }) => ({ url: `/students/${studentId}/parents/${parentId}`, method: 'DELETE' }),
      invalidatesTags: ['Parent'],
    }),
  }),
});

export const {
  useSearchParentsQuery,
  useGetStudentParentsQuery,
  useLinkParentMutation,
  useUpdateParentMutation,
  useUnlinkParentMutation,
} = parentsApi;
