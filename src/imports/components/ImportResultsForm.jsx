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
 * its review, where the counts are shown. Nothing is saved yet.
 */
export default function ImportResultsForm({ cycle, stage, mockExam, exam, onClose }) {
  return (
    <ResponsiveSheet onClose={onClose}>
      <ImportResultsFormContent cycle={cycle} stage={stage} mockExam={mockExam} exam={exam} onClose={onClose} />
    </ResponsiveSheet>
  );
}

function ImportResultsFormContent({ cycle, stage, mockExam, exam, onClose }) {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [asking, setAsking] = useState(false);
  const [serverError, setServerError] = useState(null);
  const [upload, { isLoading }] = useUploadExamResultsMutation();

  const submit = async () => {
    setServerError(null);
    try {
      const batch = await upload({ examId: exam.id, file }).unwrap();
      onClose();
      navigate(`/imports/${batch.id}`);
    } catch (error) {
      setAsking(false);
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
      aria-label="Importar resultados"
      sx={{ display: 'flex', flexDirection: 'column', gap: 1.75, p: { xs: '12px 20px 24px', md: 3 }, overflowY: 'auto' }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        <Typography component="h2" sx={{ fontSize: 18, fontWeight: 500 }}>
          Importar resultados
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

      <Box sx={{ display: 'flex', gap: 1, pt: 0.5 }}>
        <Button variant="outlined" onClick={onClose} disabled={isLoading} sx={{ flex: 1, height: 48 }}>
          Cancelar
        </Button>
        <Button type="submit" variant="contained" color="secondary" disabled={!file || isLoading} sx={{ flex: 1, height: 48 }}>
          Importar
        </Button>
      </Box>

      {asking && (
        <ConfirmDialog
          title="¿Importar resultados?"
          message={
            `Se leerá ${file.name} como los resultados de ${mockExam.name} · ${exam.examTypeName}. ` +
            'Quedarán en una importación por revisar: nada se guarda hasta que la confirmes, y una vez confirmada el examen ya no acepta otra carga.'
          }
          confirmLabel="Importar"
          loading={isLoading}
          onConfirm={submit}
          onCancel={() => setAsking(false)}
        />
      )}
    </Box>
  );
}
