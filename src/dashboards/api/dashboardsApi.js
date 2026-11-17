import { baseApi } from '../../app/api/baseApi';

// Dashboards over the stored exam results (REQ-DASHBOARDS). ADMIN reads any
// student; a TUTOR only their current ones (403 otherwise). Every query
// takes { studentId, includeAllCycles } — by default only the active cycle —
// and brings only the exams the student sat, by exam date.
const studentChart = (name) => ({
  query: ({ studentId, includeAllCycles = false }) => ({
    url: `/dashboards/students/${studentId}/${name}`,
    params: { includeAllCycles },
  }),
  // confirming a results import changes it
  providesTags: ['Exam'],
});

export const dashboardsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // [{ examId, examName, examTypeName, examDate, cycleName, studentScore,
    //    merit, meritOf, examMax, examMin, areaScores: [{ areaId, areaName, score }] }]
    getScoreEvolution: build.query(studentChart('score-evolution')),
    // one series per course, only with the exams that evaluated it:
    // [{ courseId, courseName, points: [{ examId, examName, examDate, cycleName, correct, wrong, blank }] }]
    getCourseEffectiveness: build.query(studentChart('course-effectiveness')),
    // counts, not ratios: { areas: [{ areaId, areaName, points: [{ examId, examName,
    //   examDate, cycleName, correct, wrong }] }], totals: [same points] }
    getAreaDistribution: build.query(studentChart('area-distribution')),
    // REQ-DASHBOARDS-04, always the active cycle: { current, previous }, each null or
    // { examId, examName, examTypeName, examDate, axes: [{ courseId, courseName, correct,
    //   total, percent }] } — one axis per Mathematics course evaluated in that exam
    getMathRadar: build.query({
      query: (studentId) => `/dashboards/students/${studentId}/math-radar`,
      providesTags: ['Exam'],
    }),
    // "Charla de notas": { examTypeId, tutorId? } → by exam date, only the active cycle:
    // [{ examId, examName, examDate, students, areas: [{ areaId, areaName, correctAvg,
    //    correctMin, correctMax, wrongAvg, wrongMin, wrongMax }], courses: [{ courseId,
    //    courseName, correctAvg }] }]. A tutor always gets their own students; tutorId is
    // only for an admin (the whole academy without it).
    getGroupComparison: build.query({
      query: ({ examTypeId, tutorId }) => ({
        url: '/dashboards/group-comparison',
        params: tutorId ? { examTypeId, tutorId } : { examTypeId },
      }),
      // results (imports) and regrouping students between tutors change it
      providesTags: ['Exam', 'TutorAssignment', 'Enrollment'],
    }),
  }),
});

export const {
  useGetScoreEvolutionQuery,
  useGetCourseEffectivenessQuery,
  useGetAreaDistributionQuery,
  useGetMathRadarQuery,
  useGetGroupComparisonQuery,
} = dashboardsApi;
