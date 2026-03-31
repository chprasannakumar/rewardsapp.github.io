import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import Typography from '@mui/material/Typography';
import ReusableTable from './ReusableTable';

const TotalRewardsTable = ({ rewards, isLoading }) => {
  const [order, setOrder] = useState('desc');
  const [orderBy, setOrderBy] = useState('points');

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
    { id: 'customerName', label: 'Customer Name' },
    { id: 'points', label: 'Total Reward Points' },
  ];

  const renderCell = (colId, reward) => {
    switch (colId) {
      case 'customerName':
        return <span style={{ fontWeight: 700, paddingTop: '8px', paddingBottom: '8px', display: 'block' }}>{reward?.customerName}</span>;
      case 'points':
        return (
          <Typography sx={{ fontWeight: 900, color: 'primary.main', fontSize: '1.2rem' }}>
            {reward.points.toLocaleString()}
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
      rowKey={(reward) => reward.customerId}
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

export default TotalRewardsTable;
