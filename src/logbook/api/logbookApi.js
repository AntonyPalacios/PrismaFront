import { baseApi } from '../../app/api/baseApi';

// A student's logbook (REQ-LOGBOOK-01/02). ADMIN and the student's current
// tutor read it; only the current tutor writes. Entries are immutable: there
// is no update or delete. A page is { entries, page, size, totalElements,
// hasMore }, newest session first; an entry is { id, studentId, authorUserId,
// authorName, sessionDate, createdAt, reason, agreements, observations }.
export const logbookApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getLogbookPage: build.query({
      query: ({ studentId, page = 0, size = 20 }) => ({ url: `/students/${studentId}/logbook-entries`, params: { page, size } }),
      providesTags: (result, error, { studentId }) => [{ type: 'Logbook', id: studentId }],
    }),
    // { studentId, sessionDate, reason, agreements, observations, confirm }
    createLogEntry: build.mutation({
      query: ({ studentId, ...body }) => ({ url: `/students/${studentId}/logbook-entries`, method: 'POST', body }),
      invalidatesTags: (result, error, { studentId }) => [{ type: 'Logbook', id: studentId }],
    }),
  }),
});

export const { useGetLogbookPageQuery, useCreateLogEntryMutation } = logbookApi;
