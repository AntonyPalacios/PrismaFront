import { useState } from 'react';
import { useNavigate } from 'react-router';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { formatDate } from '../../academic/cycleDisplay';
import { errorDetail } from '../../app/api/errors';
import ConfirmDialog from '../../layout/ConfirmDialog';
import ResponsiveSheet from '../../layout/ResponsiveSheet';
import { useUploadExamResultsMutation } from '../api/importsApi';

/**
 * "Importar resultados" (Claude Design: ImportSummaryMobile) of one exam
 * type of a mock exam: the exam it is for, read-only, and the academy's
 * Excel. Asks before uploading; uploading creates a pending batch and opens
 * its review, where the counts are shown. Nothing is saved yet. With
 * `reload` (an ADMIN, on an exam that already has results) it warns that
 * confirming the batch replaces the current results. An exam with an
 * import in review stops the upload: go to it, or discard it and upload
 * this file instead (agreements of 2026-11-18).
 */
export default function ImportResultsForm({ cycle, stage, mockExam, exam, reload = false, onClose }) {
  return (
    <ResponsiveSheet onClose={onClose}>
      <ImportResultsFormContent cycle={cycle} stage={stage} mockExam={mockExam} exam={exam} reload={reload} onClose={onClose} />
    </ResponsiveSheet>
  );
}

function ImportResultsFormContent({ cycle, stage, mockExam, exam, reload, onClose }) {
  const title = reload ? 'Recargar resultados' : 'Importar resultados';
  const action = reload ? 'Recargar' : 'Importar';
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [asking, setAsking] = useState(false);
  const [serverError, setServerError] = useState(null);
  // the import in review that stopped the upload: { pendingBatchId, pendingFileName, pendingUploadedAt, pendingUploadedBy }
  const [pending, setPending] = useState(null);
  const [upload, { isLoading }] = useUploadExamResultsMutation();

  const submit = async (replacePending = false) => {
    setServerError(null);
    try {
      const batch = await upload({ examId: exam.id, file, reload, replacePending }).unwrap();
      onClose();
      navigate(`/imports/${batch.id}`);
    } catch (error) {
      setAsking(false);
      if (error?.data?.pendingBatchId) {
        setPending(error.data);
        return;
      }
      setServerError(errorDetail(error)); // e.g. another exam type's file: choose the right one
    }
  };

  return (
    <Box
      component="form"
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        setAsking(true);
      }}
      aria-label={title}
      sx={{ display: 'flex', flexDirection: 'column', gap: 1.75, p: { xs: '12px 20px 24px', md: 3 }, overflowY: 'auto' }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        <Typography component="h2" sx={{ fontSize: 18, fontWeight: 500 }}>
          {title}
        </Typography>
        <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
          Sube el Excel de resultados de la academia (hoja EVA). Antes de guardar nada podrás revisar cada fila.
        </Typography>
      </Box>

      <Box
        component="dl"
        sx={{ m: 0, display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '6px 12px', p: 1.5, borderRadius: '12px', bgcolor: '#EEF1F6', fontSize: 14 }}
      >
        <Box component="dt" sx={{ color: 'text.secondary' }}>
          Examen
        </Box>
        <Box component="dd" sx={{ m: 0, fontWeight: 500 }}>
          {mockExam.name} · {formatDate(mockExam.examDate)}
        </Box>
        <Box component="dt" sx={{ color: 'text.secondary' }}>
          Etapa
        </Box>
        <Box component="dd" sx={{ m: 0 }}>
          {cycle.name} · {stage.name}
        </Box>
        <Box component="dt" sx={{ color: 'text.secondary' }}>
          Tipo de examen
        </Box>
        <Box component="dd" sx={{ m: 0 }}>
          <Box component="span" sx={{ fontSize: 12, fontWeight: 500, px: 1.25, py: 0.375, borderRadius: '12px', bgcolor: '#E1EBF7', color: '#002F6C' }}>
            {exam.examTypeName}
          </Box>
        </Box>
      </Box>

      {reload && (
        <Alert severity="warning">
          Este examen ya tiene resultados. Al confirmar la importación, los resultados actuales se reemplazan por los de este
          archivo: quien no venga en él se queda sin resultado en este examen.
        </Alert>
      )}

      <Button variant="outlined" component="label" sx={{ height: 48, justifyContent: 'flex-start' }}>
        {file ? file.name : 'Elegir archivo (.xlsx)'}
        <input
          hidden
          type="file"
          accept=".xlsx"
          aria-label="Archivo de resultados"
          onChange={(e) => {
            setFile(e.target.files?.[0] ?? null);
            setServerError(null);
          }}
        />
      </Button>

      {serverError && <Alert severity="error">{serverError}</Alert>}

      {pending && (
        <Alert severity="warning" role="alert" sx={{ '& .MuiAlert-message': { width: '100%' } }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <span>
              {`Este examen ya tiene una importación en revisión: ${pending.pendingFileName}, subida el ${formatDate(
                pending.pendingUploadedAt.slice(0, 10),
              )}${pending.pendingUploadedBy ? ` por ${pending.pendingUploadedBy}` : ''}. Continúala o descártala para subir este archivo.`}
            </span>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              <Button
                size="small"
                variant="outlined"
                onClick={() => {
                  onClose();
                  navigate(`/imports/${pending.pendingBatchId}`);
                }}
              >
                Ir a la importación
              </Button>
              <Button size="small" variant="contained" color="warning" disabled={isLoading} onClick={() => submit(true)}>
                Descartar la anterior y subir esta
              </Button>
            </Box>
          </Box>
        </Alert>
      )}

      <Box sx={{ display: 'flex', gap: 1, pt: 0.5 }}>
        <Button variant="outlined" onClick={onClose} disabled={isLoading} sx={{ flex: 1, height: 48 }}>
          Cancelar
        </Button>
        <Button type="submit" variant="contained" color="secondary" disabled={!file || isLoading} sx={{ flex: 1, height: 48 }}>
          {action}
        </Button>
      </Box>

      {asking && (
        <ConfirmDialog
          title={`¿${title}?`}
          message={
            `Se leerá ${file.name} como los resultados de ${mockExam.name} · ${exam.examTypeName}. ` +
            (reload
              ? 'Quedarán en una importación por revisar: los resultados actuales no cambian hasta que la confirmes; al confirmarla se reemplazan.'
              : 'Quedarán en una importación por revisar: nada se guarda hasta que la confirmes, y una vez confirmada el examen ya no acepta otra carga.')
          }
          confirmLabel={action}
          loading={isLoading}
          onConfirm={() => submit(false)}
          onCancel={() => setAsking(false)}
        />
      )}
    </Box>
  );
}
