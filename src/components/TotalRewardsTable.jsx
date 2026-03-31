import React, { useState, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import Typography from '@mui/material/Typography';
import ReusableTable from './ReusableTable';
import ErrorBoundary from './common/ErrorBoundary';
import { SORT_DIRECTION } from '../constants';

const COLUMNS = [
  { id: 'customerName', label: 'Customer Name' },
  { id: 'points', label: 'Total Reward Points' },
];

const TotalRewardsTable = ({ rewards, isLoading }) => {
  const [order, setOrder] = useState(SORT_DIRECTION.DESC);
  const [orderBy, setOrderBy] = useState('points');

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

  const renderCell = useCallback((colId, reward) => {
    switch (colId) {
      case 'customerName':
        return (
          <span style={{ fontWeight: 700, paddingTop: '0.5rem', paddingBottom: '0.5rem', display: 'block' }}>
            {reward?.customerName ?? '—'}
          </span>
        );
      case 'points':
        return (
          <Typography sx={{ fontWeight: 900, color: 'primary.main', fontSize: '1.2rem' }}>
            {(reward?.points ?? 0).toLocaleString()}
          </Typography>
        );
      default:
        return null;
    }
  }, []);

  return (
    <ReusableTable
      columns={COLUMNS}
      rows={sortedRewards}
      rowKey={(reward) => reward?.customerId ?? Math.random()}
      renderCell={renderCell}
      order={order}
      orderBy={orderBy}
      onRequestSort={handleRequestSort}
      title="Leaderboard"
      titleColor="success.main"
      headerBgColor="#ecfdf5"
      headerTextColor="#059669"
      isLoading={isLoading}
      maxHeight={400}
      paperSx={{ height: '100%' }}
      emptyMessage="No total rewards calculated."
    />
  );
};

TotalRewardsTable.propTypes = {
  rewards: PropTypes.arrayOf(
    PropTypes.shape({
      customerId: PropTypes.string.isRequired,
      customerName: PropTypes.string.isRequired,
      points: PropTypes.number.isRequired,
    })
  ).isRequired,
  isLoading: PropTypes.bool,
};

const TotalRewardsTableWithBoundary = (props) => (
  <ErrorBoundary>
    <TotalRewardsTable {...props} />
  </ErrorBoundary>
);

export default TotalRewardsTableWithBoundary;
