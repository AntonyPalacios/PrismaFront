import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import { errorDetail } from '../../app/api/errors';
import { groupCoursesByArea, useGetAreasQuery, useGetCoursesQuery } from '../api/catalogApi';

/**
 * Read-only catalog: each area with its courses (Claude Design: CatalogMobile).
 * Areas and courses are fixed data, so there are no create/edit controls
 * and no status chips (they are always active).
 */
export default function CatalogPage() {
  const areas = useGetAreasQuery();
  const courses = useGetCoursesQuery();

  const isLoading = areas.isLoading || courses.isLoading;
  const error = areas.error ?? courses.error;
  const groups = groupCoursesByArea(areas.data, courses.data);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, maxWidth: 960 }}>
      <Box sx={{ display: { xs: 'none', md: 'flex' }, flexDirection: 'column', gap: 0.5 }}>
        <Typography component="h1" sx={{ fontSize: 28, fontWeight: 500 }}>
          Catálogo
        </Typography>
        <Typography sx={{ fontSize: 14, color: 'text.secondary' }}>
          Áreas y cursos que evalúan los exámenes.
        </Typography>
      </Box>

      {isLoading && (
        <Box role="status" sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress size={32} aria-label="Cargando catálogo" />
        </Box>
      )}

      {!isLoading && error && <Alert severity="error">{errorDetail(error)}</Alert>}

      {!isLoading && !error && (
        <Box
          sx={{
            display: 'grid',
            gap: { xs: 3, md: 2.5 },
            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
            alignItems: 'start',
          }}
        >
          {groups.map((area) => (
            <AreaSection key={area.id} area={area} />
          ))}
        </Box>
      )}
    </Box>
  );
}

function AreaSection({ area }) {
  const count = area.courses.length;
  return (
    <Box
      component="section"
      aria-labelledby={`area-${area.id}`}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        // desktop: the whole area lives in one white card
        bgcolor: { md: 'background.paper' },
        border: { md: 1 },
        borderColor: { md: 'divider' },
        borderRadius: { md: '16px' },
        p: { md: 2.5 },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 1 }}>
        <Typography id={`area-${area.id}`} component="h2" sx={{ fontSize: 18, fontWeight: 500 }}>
          {area.name}
          {area.abbreviation && (
            <Typography component="span" sx={{ ml: 1, fontSize: 13, color: 'text.secondary' }}>
              {area.abbreviation}
            </Typography>
          )}
        </Typography>
        <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
          {count} {count === 1 ? 'curso' : 'cursos'} · orden A–Z
        </Typography>
      </Box>

      <Box component="ul" sx={{ listStyle: 'none', m: 0, p: 0, display: 'flex', flexDirection: 'column', gap: 1 }}>
        {area.courses.map((course) => (
          <Box
            component="li"
            key={course.id}
            sx={{
              px: 2,
              py: 1.75,
              bgcolor: 'background.paper',
              border: 1,
              borderColor: 'divider',
              borderRadius: '14px', // as in the prototype (theme units would multiply by 12)
            }}
          >
            <Typography sx={{ fontSize: 15, fontWeight: 500 }}>{course.displayLabel ?? course.name}</Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
