import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import ReusableTable from './ReusableTable';

const MonthlyRewardsTable = ({ rewards, isLoading }) => {
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('month');

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const sortedRewards = useMemo(() => {
    return [...rewards].sort((a, b) => {
      let aValue = a[orderBy];
      let bValue = b[orderBy];
      if (bValue < aValue) return order === 'asc' ? 1 : -1;
      if (bValue > aValue) return order === 'asc' ? -1 : 1;
      return 0;
    });
  }, [rewards, order, orderBy]);

  const columns = [
    { id: 'customerId', label: 'Customer ID' },
    { id: 'customerName', label: 'Name' },
    { id: 'month', label: 'Month' },
    { id: 'year', label: 'Year' },
    { id: 'points', label: 'Reward Points' },
  ];

  const renderCell = (colId, reward) => {
    switch (colId) {
      case 'customerId':
        return <span style={{ color: '#64748b', fontSize: '0.85rem' }}>{reward.customerId}</span>;
      case 'customerName':
        return <span style={{ fontWeight: 700 }}>{reward?.customerName}</span>;
      case 'month':
        return (
          <Box sx={{ color: 'primary.main', fontWeight: 800, bgcolor: '#eef2ff', px: 1.5, py: 0.5, borderRadius: 1.5, display: 'inline-block', fontSize: '0.9rem' }}>
            {reward.month}
          </Box>
        );
      case 'year':
        return <span style={{ color: '#64748b', fontWeight: 600 }}>{reward.year}</span>;
      case 'points':
        return (
          <Typography sx={{ fontWeight: 900, color: 'secondary.main', fontSize: '1rem' }}>
            {reward.points.toLocaleString()} <span style={{ fontSize: '0.7rem' }}>PTS</span>
          </Typography>
        );
      default:
        return null;
    }
  };

  return (
    <ReusableTable
      columns={columns}
      rows={sortedRewards}
      rowKey={(reward) => `${reward.customerId}_${reward.year}_${reward.month}`}
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

export default MonthlyRewardsTable;