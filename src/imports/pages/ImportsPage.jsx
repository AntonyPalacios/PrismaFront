import { useNavigate } from 'react-router';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { errorDetail } from '../../app/api/errors';
import { colors } from '../../app/theme';
import { useGetImportBatchesQuery } from '../api/importsApi';
import { BATCH_STATUS, isResults } from '../importDisplay';
import { Chip } from './ImportBatchPage';

const DATE_TIME = new Intl.DateTimeFormat('es-PE', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'America/Lima' });

/**
 * "Importaciones": the imports of students and of exam results, newest
 * first, so a pending one can be resumed (or discarded) from its review. A
 * COORDINADOR only gets the results ones. New imports start in Alumnos
 * (students) or in Exámenes (results).
 */
export default function ImportsPage() {
  const navigate = useNavigate();
  const { data: batches = [], isLoading, error } = useGetImportBatchesQuery();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 860 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        <Typography component="h1" sx={{ fontSize: { xs: 22, md: 28 }, fontWeight: 500 }}>
          Importaciones
        </Typography>
        <Typography sx={{ fontSize: 14, color: 'text.secondary' }}>
          Los archivos subidos y su revisión. Para importar alumnos, ve a Alumnos › Importar alumnos; para importar resultados,
          abre un examen en Exámenes.
        </Typography>
      </Box>

      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress size={32} aria-label="Cargando importaciones" />
        </Box>
      )}
      {!isLoading && error && <Alert severity="error">{errorDetail(error)}</Alert>}
      {!isLoading && !error && batches.length === 0 && (
        <Typography sx={{ py: 4, textAlign: 'center', color: 'text.secondary' }}>Aún no hay importaciones.</Typography>
      )}

      <Box component="ul" sx={{ listStyle: 'none', m: 0, p: 0, display: 'flex', flexDirection: 'column', gap: 1.25 }}>
        {batches.map((batch) => (
          <Box component="li" key={batch.id}>
            <ButtonBase
              onClick={() => navigate(`/imports/${batch.id}`)}
              aria-label={`Importación ${batch.fileName}`}
              sx={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                p: 1.75,
                bgcolor: 'background.paper',
                border: 1,
                borderColor: 'divider',
                borderRadius: '16px',
                textAlign: 'left',
                '&:hover': { borderColor: colors.secondary },
              }}
            >
              <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                  <Typography noWrap sx={{ fontSize: 15, fontWeight: 500 }}>
                    {isResults(batch)
                      ? `${batch.replacesResults ? 'Recarga de resultados' : 'Resultados'} · ${batch.examLabel ?? batch.fileName}`
                      : `Alumnos · ${batch.fileName}`}
                  </Typography>
                  <Chip status={BATCH_STATUS[batch.status]} />
                </Box>
                <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
                  {DATE_TIME.format(new Date(batch.uploadedAt))} · {batch.totalRows} {isResults(batch) ? 'alumnos' : 'filas'}
                  {batch.status === 'PENDING_REVIEW' && batch.unresolvedRows > 0 ? ` · ${batch.unresolvedRows} por revisar` : ''}
                </Typography>
              </Box>
              <ChevronRightIcon aria-hidden="true" sx={{ fontSize: 20, color: '#8C96A8' }} />
            </ButtonBase>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
