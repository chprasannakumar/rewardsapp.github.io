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
import { ROWS_PER_PAGE_OPTIONS } from '../constants';

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
        mb: '1.5rem',
        position: 'relative',
        borderRadius: '1rem',
        border: '1px solid #e2e8f0',
        boxShadow: '0 0.25rem 0.375rem -0.0625rem rgb(0 0 0 / 0.05), 0 0.125rem 0.25rem -0.125rem rgb(0 0 0 / 0.05)',
        ...paperSx,
      }}
    >
      <TableLoaderOverlay loading={isLoading} message="Processing..." />

      <Box
        sx={{
          p: title ? '1.5rem' : '1rem',
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
          sx={{ color: titleColor || 'text.primary', fontWeight: 900, letterSpacing: '-0.03125rem' }}
        >
          {title}
        </Typography>
        {titleExtra && titleExtra}
      </Box>

      <TableContainer sx={{ maxHeight }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              {(columns ?? []).map((col) => (
                <TableCell
                  key={col.id}
                  sortDirection={orderBy === col.id ? order : false}
                  sx={{
                    fontWeight: 800,
                    bgcolor: headerBgColor || '#f8fafc',
                    color: headerTextColor || '#475569',
                    textTransform: 'uppercase',
                    fontSize: '0.75rem',
                    letterSpacing: '0.0625rem',
                    py: '0.375rem',
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
            {(rows ?? []).map((row) => (
              <TableRow hover key={rowKey(row)} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                {(columns ?? []).map((col) => (
                  <TableCell key={col.id}>{renderCell(col.id, row)}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {pagination && (
        <Box sx={{ p: '0.25rem', borderTop: '1px solid #f1f5f9' }}>
          <TablePagination
            rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
            component="div"
            count={pagination.count ?? 0}
            rowsPerPage={pagination.rowsPerPage}
            page={pagination.page}
            onPageChange={pagination.onPageChange}
            onRowsPerPageChange={pagination.onRowsPerPageChange}
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
    onRowsPerPageChange: PropTypes.func.isRequired,
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
