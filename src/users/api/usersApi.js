import { baseApi } from '../../app/api/baseApi';

// User management (REQ-SECURITY-02), ADMIN only. A user is
// { id, email, firstName, lastNamePat, lastNameMat, roles, active, photoUrl, permanentAdmin }.
export const usersApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // sorted by last names; inactive ones only with includeInactive
    getUsers: build.query({
      query: ({ includeInactive = false } = {}) => `/users?includeInactive=${includeInactive}`,
      providesTags: ['User'],
    }),
    getUser: build.query({
      query: (id) => `/users/${id}`,
      providesTags: ['User'],
    }),
    createUser: build.mutation({
      query: (body) => ({ url: '/users', method: 'POST', body }),
      invalidatesTags: ['User'],
    }),
    // a role change may be the logged-in admin's own: refresh "Me" too
    updateUser: build.mutation({
      query: ({ id, ...body }) => ({ url: `/users/${id}`, method: 'PUT', body }),
      invalidatesTags: ['User', 'Me'],
    }),
    deactivateUser: build.mutation({
      query: (id) => ({ url: `/users/${id}`, method: 'DELETE' }),
      invalidatesTags: ['User'],
    }),
    reactivateUser: build.mutation({
      query: (id) => ({ url: `/users/${id}/reactivate`, method: 'POST' }),
      invalidatesTags: ['User'],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useGetUserQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeactivateUserMutation,
  useReactivateUserMutation,
} = usersApi;
