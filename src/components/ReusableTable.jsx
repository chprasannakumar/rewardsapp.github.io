import React from 'react';
import PropTypes from 'prop-types';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import TablePagination from '@mui/material/TablePagination';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import TableLoaderOverlay from './TableLoaderOverlay';

/**
 * ReusableTable - A generic sortable table component.
 *
 * Props:
 *  - columns: Array of { id, label, sortable? }
 *  - rows: Array of row data objects
 *  - rowKey: function(row) => unique key string
 *  - renderCell: function(colId, row) => React node
 *  - order, orderBy, onRequestSort: sort state & handler from parent
 *  - title: string — header title
 *  - titleColor: sx color value for title
 *  - headerBgColor: sx bgcolor for thead
 *  - headerTextColor: sx color for thead text
 *  - isLoading: bool
 *  - maxHeight: number (px) for TableContainer
 *  - paperSx: additional sx for Paper
 *  - pagination: { page, rowsPerPage, onPageChange, count } — optional
 *  - titleExtra: React node rendered beside the title (optional)
 *  - emptyMessage: string shown when rows is empty and not loading
 */
const ReusableTable = ({
  columns,
  rows,
  rowKey,
  renderCell,
  order,
  orderBy,
  onRequestSort,
  title,
  titleColor,
  headerBgColor,
  headerTextColor,
  isLoading,
  maxHeight,
  paperSx,
  pagination,
  titleExtra,
  emptyMessage,
}) => {
  if (!rows?.length && !isLoading) {
    return <Typography color="text.secondary">{emptyMessage}</Typography>;
  }

  return (
    <Paper
      elevation={0}
      sx={{
        overflow: 'hidden',
        mb: 3,
        position: 'relative',
        borderRadius: 4,
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)',
        ...paperSx,
      }}
    >
      <TableLoaderOverlay loading={isLoading} message="Processing..." />

      {/* Header */}
      <Box
        sx={{
          p: title ? 3 : 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          bgcolor: '#ffffff',
          borderBottom: '1px solid #f1f5f9',
        }}
      >
        <Typography
          variant={titleExtra ? 'h5' : 'h6'}
          component="div"
          sx={{ color: titleColor || 'text.primary', fontWeight: 900, letterSpacing: '-0.5px' }}
        >
          {title}
        </Typography>
        {titleExtra && titleExtra}
      </Box>

      {/* Table */}
      <TableContainer sx={{ maxHeight }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              {columns.map((col) => (
                <TableCell
                  key={col.id}
                  sortDirection={orderBy === col.id ? order : false}
                  sx={{
                    fontWeight: 800,
                    bgcolor: headerBgColor || '#f8fafc',
                    color: headerTextColor || '#475569',
                    textTransform: 'uppercase',
                    fontSize: '0.75rem',
                    letterSpacing: '1px',
                    py: 1.5,
                  }}
                >
                  {col.sortable === false ? (
                    col.label
                  ) : (
                    <TableSortLabel
                      active={orderBy === col.id}
                      direction={orderBy === col.id ? order : 'asc'}
                      onClick={() => onRequestSort(col.id)}
                    >
                      {col.label}
                    </TableSortLabel>
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow hover key={rowKey(row)} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                {columns.map((col) => (
                  <TableCell key={col.id}>{renderCell(col.id, row)}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination (optional) */}
      {pagination && (
        <Box sx={{ p: 1, borderTop: '1px solid #f1f5f9' }}>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={pagination.count}
            rowsPerPage={pagination.rowsPerPage}
            page={pagination.page}
            onPageChange={pagination.onPageChange}
            sx={{ border: 0 }}
          />
        </Box>
      )}
    </Paper>
  );
};

ReusableTable.propTypes = {
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      sortable: PropTypes.bool,
    })
  ).isRequired,
  rows: PropTypes.array.isRequired,
  rowKey: PropTypes.func.isRequired,
  renderCell: PropTypes.func.isRequired,
  order: PropTypes.oneOf(['asc', 'desc']).isRequired,
  orderBy: PropTypes.string.isRequired,
  onRequestSort: PropTypes.func.isRequired,
  title: PropTypes.string,
  titleColor: PropTypes.string,
  headerBgColor: PropTypes.string,
  headerTextColor: PropTypes.string,
  isLoading: PropTypes.bool,
  maxHeight: PropTypes.number,
  paperSx: PropTypes.object,
  pagination: PropTypes.shape({
    page: PropTypes.number.isRequired,
    rowsPerPage: PropTypes.number.isRequired,
    onPageChange: PropTypes.func.isRequired,
    count: PropTypes.number.isRequired,
  }),
  titleExtra: PropTypes.node,
  emptyMessage: PropTypes.string,
};

ReusableTable.defaultProps = {
  isLoading: false,
  maxHeight: 400,
  paperSx: {},
  emptyMessage: 'No data available.',
};

export default ReusableTable;
