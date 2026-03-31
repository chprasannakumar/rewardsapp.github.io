import React, { useState, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import ReusableTable from './ReusableTable';
import ErrorBoundary from './common/ErrorBoundary';
import { DEFAULT_ROWS_PER_PAGE, SORT_DIRECTION } from '../constants';

const COLUMNS = [
  { id: 'customerId', label: 'Customer ID' },
  { id: 'customerName', label: 'Name' },
  { id: 'month', label: 'Month' },
  { id: 'year', label: 'Year' },
  { id: 'points', label: 'Reward Points' },
];

const MonthlyRewardsTable = ({ rewards, isLoading }) => {
  const [order, setOrder] = useState(SORT_DIRECTION.ASC);
  const [orderBy, setOrderBy] = useState('month');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_ROWS_PER_PAGE);

  const handleRequestSort = useCallback((property) => {
    const isAsc = orderBy === property && order === SORT_DIRECTION.ASC;
    setOrder(isAsc ? SORT_DIRECTION.DESC : SORT_DIRECTION.ASC);
    setOrderBy(property);
  }, [order, orderBy]);

  const sortedRewards = useMemo(() => {
    if (!Array.isArray(rewards)) return [];
    return [...rewards].sort((a, b) => {
      const aValue = a?.[orderBy] ?? '';
      const bValue = b?.[orderBy] ?? '';
      if (bValue < aValue) return order === SORT_DIRECTION.ASC ? 1 : -1;
      if (bValue > aValue) return order === SORT_DIRECTION.ASC ? -1 : 1;
      return 0;
    });
  }, [rewards, order, orderBy]);

  const pagedRewards = useMemo(
    () => sortedRewards.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [sortedRewards, page, rowsPerPage]
  );

  const handleRowsPerPageChange = useCallback((e) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  }, []);

  const renderCell = useCallback((colId, reward) => {
    switch (colId) {
      case 'customerId':
        return <span style={{ color: '#64748b', fontSize: '0.85rem' }}>{reward?.customerId ?? '—'}</span>;
      case 'customerName':
        return <span style={{ fontWeight: 700 }}>{reward?.customerName ?? '—'}</span>;
      case 'month':
        return (
          <Box sx={{ color: 'primary.main', fontWeight: 800, bgcolor: '#eef2ff', px: 1.5, py: 0.5, borderRadius: 1.5, display: 'inline-block', fontSize: '0.9rem' }}>
            {reward?.month ?? '—'}
          </Box>
        );
      case 'year':
        return <span style={{ color: '#64748b', fontWeight: 600 }}>{reward?.year ?? '—'}</span>;
      case 'points':
        return (
          <Typography sx={{ fontWeight: 900, color: 'secondary.main', fontSize: '1rem' }}>
            {(reward?.points ?? 0).toLocaleString()} <span style={{ fontSize: '0.7rem' }}>PTS</span>
          </Typography>
        );
      default:
        return null;
    }
  }, []);

  return (
    <ReusableTable
      columns={COLUMNS}
      rows={pagedRewards}
      rowKey={(reward) => `${reward?.customerId ?? ''}_${reward?.year ?? ''}_${reward?.month ?? ''}`}
      renderCell={renderCell}
      order={order}
      orderBy={orderBy}
      onRequestSort={handleRequestSort}
      title="Monthly Aggregates"
      titleColor="secondary.main"
      headerBgColor="#fff5f7"
      headerTextColor="#e11d48"
      isLoading={isLoading}
      maxHeight={400}
      emptyMessage="No monthly rewards calculated."
      pagination={{
        page,
        rowsPerPage,
        count: sortedRewards.length,
        onPageChange: (e, newPage) => setPage(newPage),
        onRowsPerPageChange: handleRowsPerPageChange,
      }}
    />
  );
};

MonthlyRewardsTable.propTypes = {
  rewards: PropTypes.arrayOf(
    PropTypes.shape({
      customerId: PropTypes.string.isRequired,
      customerName: PropTypes.string.isRequired,
      month: PropTypes.string.isRequired,
      year: PropTypes.number.isRequired,
      points: PropTypes.number.isRequired,
    })
  ).isRequired,
  isLoading: PropTypes.bool,
};

const MonthlyRewardsTableWithBoundary = (props) => (
  <ErrorBoundary>
    <MonthlyRewardsTable {...props} />
  </ErrorBoundary>
);

export default MonthlyRewardsTableWithBoundary;
