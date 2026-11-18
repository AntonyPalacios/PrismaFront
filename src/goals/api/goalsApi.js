import { baseApi } from '../../app/api/baseApi';

// Goals of correct answers per area (REQ-GOALS-01), ADMIN and TUTOR only.
// The sheet of a mock exam is { mockExamId, mockExamName, examDate,
// areas: [{ areaId, areaName }], rows: [{ enrollmentId, studentId, fullName,
// tutorName, examId, examTypeName, noExamReason, attended, goals: [{ areaId,
// suggested, basedOnExamName, target, actual }] }] } — examId null means no
// goal can be set (noExamReason NO_EXAM_TYPE | EXAM_TYPE_MISSING);
// attended null = no result yet.
export const goalsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // the mock exams of the active cycle, by date: [{ id, name, examDate, stageName }]
    getGoalMockExams: build.query({
      query: () => '/goals/mock-exams',
      providesTags: ['Exam'],
    }),
    // a tutor always gets their own group; an admin everyone or one tutor's (tutorId)
    getGoalSheet: build.query({
      query: ({ mockExamId, tutorId }) => ({ url: '/goals/sheet', params: { mockExamId, tutorId } }),
      providesTags: ['Goal', 'Exam', 'Enrollment', 'TutorAssignment'],
    }),
    // { mockExamId, goals: [{ enrollmentId, areaId, targetCorrect }] }, all or nothing; null removes a goal
    saveGoalSheet: build.mutation({
      query: (body) => ({ url: '/goals/sheet', method: 'PUT', body }),
      invalidatesTags: ['Goal'],
    }),
    // the student's goals in the active cycle: [{ id, mockExamId, mockExamName, examDate,
    // examTypeName, areaId, areaName, targetCorrect, actual, attended, met }]
    getStudentGoals: build.query({
      query: (studentId) => ({ url: '/goals', params: { studentId } }),
      providesTags: ['Goal', 'Exam'],
    }),
  }),
});

export const { useGetGoalMockExamsQuery, useGetGoalSheetQuery, useSaveGoalSheetMutation, useGetStudentGoalsQuery } = goalsApi;
