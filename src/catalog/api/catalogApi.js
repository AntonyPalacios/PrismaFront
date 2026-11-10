import { baseApi } from '../../app/api/baseApi';

// Areas and courses are fixed reference data: read-only, never cached as
// "stale" for long because they basically never change (project agreement,
// 2026-11-10). The backend already returns both lists A–Z.
export const catalogApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // [{ id, name, abbreviation, active }]
    getAreas: build.query({ query: () => '/areas', keepUnusedDataFor: 3600 }),
    // [{ id, areaId, areaName, name, abbreviation, active, displayLabel }]
    getCourses: build.query({ query: () => '/courses', keepUnusedDataFor: 3600 }),
  }),
});

export const { useGetAreasQuery, useGetCoursesQuery } = catalogApi;

/**
 * Areas (in backend order) each with its courses (in backend order).
 * Pure function so the grouping rule is testable without rendering.
 */
export function groupCoursesByArea(areas = [], courses = []) {
  return areas.map((area) => ({
    ...area,
    courses: courses.filter((course) => course.areaId === area.id),
  }));
}
