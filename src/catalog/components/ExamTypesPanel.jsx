import { useState } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ButtonBase from '@mui/material/ButtonBase';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Fab from '@mui/material/Fab';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import { errorDetail } from '../../app/api/errors';
import { colors } from '../../app/theme';
import { useIsAdmin } from '../../users/api/authApi';
import { useGetExamTypesQuery } from '../api/examTypesApi';
import ExamTypeForm from './ExamTypeForm';

/**
 * "Tipos de examen" tab: every exam type with the courses it evaluates.
 * ADMIN can create one and open any to edit it; other roles only read.
 */
export default function ExamTypesPanel() {
  const isAdmin = useIsAdmin();
  const { data: examTypes = [], isLoading, error } = useGetExamTypesQuery();
  // null = closed, {} = creating, an exam type = editing it
  const [editing, setEditing] = useState(null);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, pb: { xs: 10, md: 0 } }}>
      {isAdmin && (
        <Box sx={{ display: { xs: 'none', md: 'flex' }, justifyContent: 'flex-end' }}>
          <Button variant="contained" color="secondary" startIcon={<AddIcon />} onClick={() => setEditing({})}>
            Nuevo tipo de examen
          </Button>
        </Box>
      )}

      {isLoading && (
        <Box role="status" sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress size={32} aria-label="Cargando tipos de examen" />
        </Box>
      )}

      {!isLoading && error && <Alert severity="error">{errorDetail(error)}</Alert>}

      {!isLoading && !error && (
        <>
          <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
            {examTypes.length} {examTypes.length === 1 ? 'tipo de examen' : 'tipos de examen'} · orden A–Z
          </Typography>
          <Box component="ul" sx={{ listStyle: 'none', m: 0, p: 0, display: 'flex', flexDirection: 'column', gap: 1 }}>
            {examTypes.map((examType) => (
              <Box component="li" key={examType.id}>
                <ExamTypeCard
                  examType={examType}
                  onOpen={isAdmin ? () => setEditing(examType) : undefined}
                />
              </Box>
            ))}
          </Box>
        </>
      )}

      {isAdmin && (
        <Fab
          variant="extended"
          color="secondary"
          onClick={() => setEditing({})}
          sx={{
            display: { md: 'none' },
            position: 'fixed',
            right: 16,
            bottom: 24,
            height: 56,
            borderRadius: '16px',
            px: 2.5,
            textTransform: 'none',
            fontSize: 15,
            boxShadow: '0 6px 16px rgba(0,47,108,0.3)',
          }}
        >
          <AddIcon sx={{ mr: 1 }} />
          Nuevo tipo de examen
        </Fab>
      )}

      {editing && <ExamTypeForm examType={editing.id ? editing : null} onClose={() => setEditing(null)} />}
    </Box>
  );
}

function ExamTypeCard({ examType, onOpen }) {
  const content = (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, width: '100%', textAlign: 'left' }}>
      <Typography sx={{ fontSize: 15, fontWeight: 500 }}>{examType.name}</Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }} aria-label={`Cursos de ${examType.name}`}>
        {examType.courseNames.map((name) => (
          <Chip
            key={name}
            label={name}
            size="small"
            sx={{ bgcolor: colors.selected, color: colors.primary, fontWeight: 500, fontSize: 12 }}
          />
        ))}
      </Box>
    </Box>
  );
  const cardSx = {
    width: '100%',
    px: 2,
    py: 1.75,
    bgcolor: 'background.paper',
    border: 1,
    borderColor: 'divider',
    borderRadius: '14px',
  };

  if (!onOpen) return <Box sx={cardSx}>{content}</Box>;
  return (
    <ButtonBase
      onClick={onOpen}
      aria-label={`Editar ${examType.name}`}
      sx={{ ...cardSx, '&:hover': { borderColor: colors.secondary } }}
    >
      {content}
    </ButtonBase>
  );
}
