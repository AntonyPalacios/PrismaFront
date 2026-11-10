import { baseApi } from '../../app/api/baseApi';

export const authApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // { id, email, firstName, lastName, roles, photoUrl } — the only source
    // of truth for "who am I" and "am I logged in".
    getMe: build.query({
      query: () => '/auth/me',
      providesTags: ['Me'],
    }),
    logout: build.mutation({
      query: () => ({ url: '/auth/logout', method: 'POST' }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
        } finally {
          // Forget everything cached for this user, even if the call failed:
          // the user asked to leave.
          dispatch(baseApi.util.resetApiState());
        }
      },
    }),
  }),
});

export const { useGetMeQuery, useLogoutMutation } = authApi;

/** True when the logged-in user has the ADMIN role (UI only; the backend enforces it). */
export function useIsAdmin() {
  const { data: me } = useGetMeQuery();
  return Boolean(me?.roles?.includes('ADMIN'));
}

export const ROLE_LABELS ={ ADMIN: 'Admin', TUTOR: 'Tutor', COORDINADOR: 'Coordinador' };

/** "Apellidos, Nombres" — the display order agreed for every person in the app. */
export function displayName(me) {
  return me ? `${me.lastName}, ${me.firstName}` : '';
}

export function initials(me) {
  return me ? `${me.lastName?.[0] ?? ''}${me.firstName?.[0] ?? ''}`.toUpperCase() : '';
}
