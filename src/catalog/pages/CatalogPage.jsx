import { useSearchParams } from 'react-router';
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';
import AreasCoursesPanel from '../components/AreasCoursesPanel';
import ExamTypesPanel from '../components/ExamTypesPanel';

const TABS = [
  { value: 'areas', label: 'Áreas y cursos' },
  { value: 'exam-types', label: 'Tipos de examen' },
];

/**
 * Catalog with tabs, as in the Claude Design prototype (CatalogMobile).
 * The selected tab lives in the URL (?tab=exam-types) so a reload or a
 * shared link opens the same tab.
 */
export default function CatalogPage() {
  const [params, setParams] = useSearchParams();
  const tab = TABS.some((t) => t.value === params.get('tab')) ? params.get('tab') : 'areas';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, maxWidth: 960 }}>
      <Box sx={{ display: { xs: 'none', md: 'flex' }, flexDirection: 'column', gap: 0.5 }}>
        <Typography component="h1" sx={{ fontSize: 28, fontWeight: 500 }}>
          Catálogo
        </Typography>
        <Typography sx={{ fontSize: 14, color: 'text.secondary' }}>
          Áreas, cursos y los tipos de examen que los evalúan.
        </Typography>
      </Box>

      <Tabs
        value={tab}
        onChange={(_, value) => setParams(value === 'areas' ? {} : { tab: value }, { replace: true })}
        variant="fullWidth"
        aria-label="Secciones del catálogo"
        sx={{
          // mobile: full-bleed white strip under the blue app bar, as in the prototype
          mx: { xs: -2, md: 0 },
          mt: { xs: -2, md: 0 },
          bgcolor: 'background.paper',
          borderBottom: 1,
          borderColor: 'divider',
          borderRadius: { md: '12px 12px 0 0' },
          '& .MuiTab-root': { fontSize: 14, fontWeight: 500, minHeight: 48 },
        }}
      >
        {TABS.map((t) => (
          <Tab key={t.value} value={t.value} label={t.label} />
        ))}
      </Tabs>

      {tab === 'areas' ? <AreasCoursesPanel /> : <ExamTypesPanel />}
    </Box>
  );
}
