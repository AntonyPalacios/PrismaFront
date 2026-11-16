import { baseApi } from '../../app/api/baseApi';

// Dashboards over the stored exam results (REQ-DASHBOARDS). ADMIN reads any
// student; a TUTOR only their current ones (403 otherwise). A point of the
// score evolution is { examId, examName, examTypeName, examDate, cycleName,
// studentScore, merit, meritOf, examMax, examMin, areaScores: [{ areaId,
// areaName, score }] }, by exam date; only exams the student sat.
export const dashboardsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // { studentId, includeAllCycles } — by default only the active cycle
    getScoreEvolution: build.query({
      query: ({ studentId, includeAllCycles = false }) => ({
        url: `/dashboards/students/${studentId}/score-evolution`,
        params: { includeAllCycles },
      }),
      // confirming a results import changes it
      providesTags: ['Exam'],
    }),
  }),
});

export const { useGetScoreEvolutionQuery } = dashboardsApi;
