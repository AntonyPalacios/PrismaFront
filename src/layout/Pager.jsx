import TablePagination from '@mui/material/TablePagination';
import { PAGE_SIZES, shownPage } from './paging';

/**
 * The pager of every long list (agreements of 2026-11-19): 10, 25 or 50
 * rows per page, 10 by default. It only shows when there is more than one
 * page of the smallest size.
 */
export default function Pager({ count, page, onPageChange, size, onSizeChange, sx }) {
  if (count <= PAGE_SIZES[0]) return null;
  return (
    <TablePagination
      component="div"
      count={count}
      page={shownPage(page, count, size)}
      onPageChange={(_, next) => onPageChange(next)}
      rowsPerPage={size}
      rowsPerPageOptions={PAGE_SIZES}
      onRowsPerPageChange={(e) => onSizeChange(Number(e.target.value))}
      labelRowsPerPage="Por página"
      labelDisplayedRows={({ from, to, count: total }) => `${from}–${to} de ${total}`}
      getItemAriaLabel={(type) => (type === 'next' ? 'Página siguiente' : type === 'previous' ? 'Página anterior' : type)}
      sx={{ bgcolor: 'background.paper', border: 1, borderColor: 'divider', borderRadius: '12px', ...sx }}
    />
  );
}
