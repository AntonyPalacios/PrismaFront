import { useState } from 'react';
import { Link as RouterLink, useNavigate, useParams } from 'react-router';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ButtonBase from '@mui/material/ButtonBase';
import CircularProgress from '@mui/material/CircularProgress';
import LinearProgress from '@mui/material/LinearProgress';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import { errorDetail } from '../../app/api/errors';
import { useNotify } from '../../app/notifyContext';
import { colors } from '../../app/theme';
import ConfirmDialog from '../../layout/ConfirmDialog';
import { useConfirmImportBatchMutation, useDiscardImportBatchMutation, useGetImportBatchQuery } from '../api/importsApi';
import RowResolution from '../components/RowResolution';
import {
  ABSENT,
  BATCH_STATUS,
  ENROLLS,
  isResults,
  newStudentName,
  NO_CAREER,
  NO_TUTOR,
  RESULT_ROW_FILTERS,
  RESULT_ROW_STATUS,
  ROW_FILTERS,
  ROW_STATUS,
  scores,
} from '../importDisplay';

/**
 * Review of a batch (Claude Design: ImportSummaryMobile and
 * ReviewQueueMobile), of students or of an exam's results: what the file
 * brought, how many rows are resolved,
 * the rows by filter (a row opens its resolution) and, while pending,
 * "Confirmar lote" (only with every row resolved, asks first) and
 * "Descartar lote". Nothing is saved until the batch is confirmed.
 */
export default function ImportBatchPage() {
  const { id } = useParams();
  const { data: batch, isLoading, error } = useGetImportBatchQuery(id);

  if (isLoading) {
    return (
      <Box role="status" sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <CircularProgress size={32} aria-label="Cargando importación" />
      </Box>
    );
  }
  if (error) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <BackLink />
        <Alert severity="error">{errorDetail(error)}</Alert>
      </Box>
    );
  }
  return <BatchReview batch={batch} />;
}

function BackLink() {
  return (
    <Link component={RouterLink} to="/imports" underline="none" sx={{ fontSize: 13, alignSelf: 'flex-start', py: 0.5 }}>
      ‹ Importaciones
    </Link>
  );
}

function BatchReview({ batch }) {
  const notify = useNotify();
  const navigate = useNavigate();
  const pending = batch.status === 'PENDING_REVIEW';
  const [filter, setFilter] = useState(batch.unresolvedRows > 0 ? 'UNRESOLVED' : 'RESOLVED');
  const [openRowId, setOpenRowId] = useState(null);
  const [dialog, setDialog] = useState(null); // 'confirm' | 'discard'
  const [serverError, setServerError] = useState(null);
  const [confirmBatch, { isLoading: confirming }] = useConfirmImportBatchMutation();
  const [discardBatch, { isLoading: discarding }] = useDiscardImportBatchMutation();
  const resolved = batch.totalRows - batch.unresolvedRows;
  const status = BATCH_STATUS[batch.status];
  const results = isResults(batch);
  const filters = results ? RESULT_ROW_FILTERS : ROW_FILTERS;
  const rows = batch.rows.filter(filters.find((f) => f.key === filter).matches);
  const openRow = batch.rows.find((row) => row.id === openRowId);
  const toEnroll = batch.newRows + batch.matchedRows;
  // career and tutor only matter when a students batch enrolls
  const enrolls = !results && Boolean(batch.stageLabel);
  const toSave = batch.totalRows - batch.ignoredRows;
  const enrolling = batch.rows.filter((row) => row.enrolls).length;

  const confirm = async () => {
    setServerError(null);
    try {
      await confirmBatch(batch.id).unwrap();
      notify('Importación confirmada.');
    } catch (error) {
      setServerError(errorDetail(error));
    } finally {
      setDialog(null);
    }
  };

  const discard = async () => {
    try {
      await discardBatch(batch.id).unwrap();
      notify('Importación descartada.');
      navigate('/imports');
    } catch (error) {
      setServerError(errorDetail(error));
      setDialog(null);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 860, pb: 4 }}>
      <BackLink />
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          <Typography component="h1" sx={{ fontSize: { xs: 22, md: 26 }, fontWeight: 500 }}>
            Revisión de importación
          </Typography>
          <Chip status={status} />
        </Box>
        <Typography sx={{ fontSize: 14, color: 'text.secondary' }}>
          {results
            ? `Resultados de ${batch.examLabel ?? 'un examen eliminado'} · ${batch.stageLabel} · ${batch.fileName}`
            : `${batch.fileName} · ${batch.stageLabel ? `Matricular en ${batch.stageLabel}` : 'Solo registrar (sin matrícula)'}`}
        </Typography>
      </Box>

      {results ? (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', md: 'repeat(4, minmax(0, 1fr))' }, gap: 1.25 }}>
          <Stat value={batch.totalRows} label="alumnos en el archivo" />
          <Stat value={batch.skippedRows} label="descartadas por ser filas vacías o basura" />
          <Stat value={batch.matchedRows} label="calzaron con un alumno" color="#2F5A08" />
          <Stat value={batch.unresolvedRows} label="requieren revisión" color="#7A4100" highlight={batch.unresolvedRows > 0} />
        </Box>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', md: 'repeat(4, minmax(0, 1fr))' }, gap: 1.25 }}>
          <Stat value={batch.totalRows} label="filas en el archivo" />
          <Stat value={batch.newRows} label="alumnos nuevos" />
          <Stat value={batch.matchedRows} label="ya registrados (actualizan datos)" color="#2F5A08" />
          <Stat value={batch.unresolvedRows} label="requieren revisión" color="#7A4100" highlight={batch.unresolvedRows > 0} />
        </Box>
      )}

      {pending && results && (
        <Alert severity="info">
          Aún no se guardó nada. Los resultados quedan en firme cuando confirmes la importación. Quedan "Sin resolver" las filas
          cuyo alumno no se reconoció o que necesitan tu decisión: elige al alumno, regístralo como nuevo o ignora la fila.
        </Alert>
      )}
      {pending && !results && (
        <Alert severity="info">
          Aún no se guardó nada. Los alumnos quedan registrados cuando confirmes la importación. Solo quedan "Sin resolver" las
          filas que necesitan tu decisión (un nombre parecido a un alumno ya registrado, o un aviso); las demás ya vienen
          resueltas y puedes cambiarlas si hace falta.
        </Alert>
      )}

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'text.secondary' }}>
          <span>
            {resolved} de {batch.totalRows} filas resueltas
          </span>
          {batch.ignoredRows > 0 && <span>{batch.ignoredRows} ignoradas</span>}
        </Box>
        <LinearProgress
          variant="determinate"
          value={batch.totalRows ? (resolved * 100) / batch.totalRows : 0}
          aria-label="Filas resueltas"
          sx={{ height: 6, borderRadius: 3 }}
        />
      </Box>

      <Box role="group" aria-label="Filtrar filas" sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        {filters.filter((f) => !f.needsStage || enrolls).map((f) => (
          <Button
            key={f.key}
            size="small"
            variant={filter === f.key ? 'contained' : 'outlined'}
            aria-pressed={filter === f.key}
            onClick={() => setFilter(f.key)}
            sx={{ borderRadius: '8px' }}
          >
            {f.label} · {batch.rows.filter(f.matches).length}
          </Button>
        ))}
      </Box>

      {rows.length === 0 ? (
        <Typography sx={{ py: 3, textAlign: 'center', color: 'text.secondary' }}>No hay filas en este filtro.</Typography>
      ) : (
        <Box component="ul" aria-label="Filas" sx={{ listStyle: 'none', m: 0, p: 0, display: 'flex', flexDirection: 'column', gap: 1.25 }}>
          {rows.map((row) => (
            <Box component="li" key={row.id}>
              {results ? (
                <ResultRowCard row={row} pending={pending} onOpen={() => setOpenRowId(row.id)} />
              ) : (
                <RowCard row={row} pending={pending} enrolls={enrolls} onOpen={() => setOpenRowId(row.id)} />
              )}
            </Box>
          ))}
        </Box>
      )}

      {serverError && <Alert severity="error">{serverError}</Alert>}

      {pending && (
        <Box sx={{ display: 'flex', gap: 1, pt: 1 }}>
          <Button variant="outlined" onClick={() => setDialog('discard')} sx={{ flex: 1, height: 48, borderColor: '#C5CCD8', color: colors.danger }}>
            Descartar importación
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => setDialog('confirm')}
            disabled={batch.unresolvedRows > 0}
            sx={{ flex: 1.4, height: 48 }}
          >
            Confirmar importación
          </Button>
        </Box>
      )}

      {openRow && (
        <RowResolution batchId={batch.id} row={openRow} results={results} editable={pending} onClose={() => setOpenRowId(null)} />
      )}

      {dialog === 'confirm' && (
        <ConfirmDialog
          title="¿Confirmar importación?"
          message={
            results
              ? `Se guardarán los resultados de ${toSave} ${toSave === 1 ? 'alumno' : 'alumnos'} en ${batch.examLabel}.` +
                (batch.newRows > 0 ? ` Se registrarán ${batch.newRows} ${batch.newRows === 1 ? 'alumno nuevo' : 'alumnos nuevos'}.` : '') +
                (enrolling > 0
                  ? ` ${enrolling} ${enrolling === 1 ? 'alumno se matriculará' : 'alumnos se matricularán'} en ${batch.stageLabel}, sin tutor.`
                  : '') +
                ignoredNote(batch.ignoredRows) +
                ' Después, este examen ya no acepta otra carga.'
              : `Se registrarán ${batch.newRows} ${batch.newRows === 1 ? 'alumno nuevo' : 'alumnos nuevos'} y se actualizarán los datos de ` +
            `${batch.matchedRows} ya ${batch.matchedRows === 1 ? 'registrado' : 'registrados'}.` +
            (batch.stageLabel
              ? ` Los ${toEnroll} quedarán matriculados en ${batch.stageLabel} con la carrera y el tutor encontrados; quien ya lo estaba no se matricula otra vez.`
              : '') +
            (batch.ignoredRows > 0 ? ` Las ${batch.ignoredRows} filas ignoradas no se guardan.` : '')
          }
          confirmLabel="Confirmar"
          loading={confirming}
          onConfirm={confirm}
          onCancel={() => setDialog(null)}
        />
      )}
      {dialog === 'discard' && (
        <ConfirmDialog
          title="¿Descartar importación?"
          message="No se guardará ninguna de sus filas. Si lo necesitas, puedes volver a subir el archivo."
          confirmLabel="Descartar"
          danger
          loading={discarding}
          onConfirm={discard}
          onCancel={() => setDialog(null)}
        />
      )}
    </Box>
  );
}

function RowCard({ row, pending, enrolls, onOpen }) {
  const marksMissing = enrolls && row.status !== 'IGNORED';
  const status = ROW_STATUS[row.status];
  return (
    <ButtonBase
      onClick={onOpen}
      aria-label={`Fila ${row.rowNumber}: ${row.fullName}`}
      sx={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        gap: 0.75,
        p: 1.75,
        bgcolor: 'background.paper',
        border: 1,
        borderColor: 'divider',
        borderRadius: '16px',
        textAlign: 'left',
        '&:hover': { borderColor: colors.secondary },
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1 }}>
        <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>Fila {row.rowNumber} del Excel</Typography>
        {pending && <Typography sx={{ fontSize: 13, fontWeight: 500, color: colors.secondary }}>Resolver ›</Typography>}
      </Box>
      <Typography sx={{ fontSize: 15, fontWeight: 500 }}>{row.fullName}</Typography>
      <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
        {[row.dni ? `DNI ${row.dni}` : 'Sin DNI', row.careerName, row.tutorName && `Tutor: ${row.tutorName}`].filter(Boolean).join(' · ')}
      </Typography>
      <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', alignItems: 'center' }}>
        <Chip status={status} />
        {marksMissing && !row.careerName && <Chip status={NO_CAREER} />}
        {marksMissing && !row.tutorName && <Chip status={NO_TUTOR} />}
        {row.student && row.status !== 'NEW_STUDENT' && (
          <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>→ {row.student.fullName}</Typography>
        )}
      </Box>
      {row.notice && <Typography sx={{ fontSize: 12, color: '#7A4100' }}>{row.notice}</Typography>}
    </ButtonBase>
  );
}

function ignoredNote(ignored) {
  if (ignored === 0) return '';
  return ignored === 1 ? ' La fila ignorada no se guarda.' : ` Las ${ignored} filas ignoradas no se guardan.`;
}

function ResultRowCard({ row, pending, onOpen }) {
  const result = row.result;
  return (
    <ButtonBase
      onClick={onOpen}
      aria-label={`Fila ${row.rowNumber}: ${row.fullName}`}
      sx={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        gap: 0.75,
        p: 1.75,
        bgcolor: 'background.paper',
        border: 1,
        borderColor: 'divider',
        borderRadius: '16px',
        textAlign: 'left',
        '&:hover': { borderColor: colors.secondary },
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1 }}>
        <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>Fila {row.rowNumber} del Excel</Typography>
        {pending && <Typography sx={{ fontSize: 13, fontWeight: 500, color: colors.secondary }}>Resolver ›</Typography>}
      </Box>
      <Typography sx={{ fontSize: 15, fontWeight: 500 }}>{row.fullName}</Typography>
      <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>{[row.dni ? `DNI ${row.dni}` : 'Sin DNI', ...scores(result)].join(' · ')}</Typography>
      <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', alignItems: 'center' }}>
        <Chip status={RESULT_ROW_STATUS[row.status]} />
        {row.enrolls && <Chip status={ENROLLS} />}
        {row.status !== 'IGNORED' && !result.attended && <Chip status={ABSENT} />}
        {row.student && row.status !== 'NEW_STUDENT' && (
          <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>→ {row.student.fullName}</Typography>
        )}
        {row.status === 'NEW_STUDENT' && row.newStudent && (
          <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>→ {newStudentName(row.newStudent)}</Typography>
        )}
      </Box>
      {row.notice && <Typography sx={{ fontSize: 12, color: '#7A4100' }}>{row.notice}</Typography>}
    </ButtonBase>
  );
}

function Stat({ value, label, color, highlight = false }) {
  return (
    <Box
      sx={{
        p: 1.75,
        borderRadius: '16px',
        border: 1,
        borderColor: highlight ? '#F7941D' : 'divider',
        bgcolor: highlight ? '#FFF7EC' : 'background.paper',
        display: 'flex',
        flexDirection: 'column',
        gap: 0.5,
      }}
    >
      <Typography sx={{ fontSize: 28, fontWeight: 500, color: color ?? 'text.primary' }}>{value}</Typography>
      <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>{label}</Typography>
    </Box>
  );
}

export function Chip({ status }) {
  return (
    <Box component="span" sx={{ fontSize: 12, fontWeight: 500, px: 1.25, py: 0.375, borderRadius: '12px', bgcolor: status.bg, color: status.fg }}>
      {status.label}
    </Box>
  );
}
