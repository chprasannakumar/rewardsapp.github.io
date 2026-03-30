import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import TableSortLabel from '@mui/material/TableSortLabel';
import TableLoaderOverlay from './TableLoaderOverlay';

import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';

const MonthlyRewardsTable = ({ rewards, isLoading }) => {
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('month');

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  // Sort data during rendering
  const sortedRewards = useMemo(() => {
    return [...rewards].sort((a, b) => {
      let aValue = a[orderBy];
      let bValue = b[orderBy];

      if (bValue < aValue) {
        return order === 'asc' ? 1 : -1;
      }
      if (bValue > aValue) {
        return order === 'asc' ? -1 : 1;
      }
      return 0;
    });
  }, [rewards, order, orderBy]);

  if (!rewards?.length && !isLoading) {
    return <Typography color="text.secondary">No monthly rewards calculated.</Typography>;
  }

  const columns = [
    { id: 'customerId', label: 'Customer ID' },
    { id: 'customerName', label: 'Name' },
    { id: 'month', label: 'Month' },
    { id: 'year', label: 'Year' },
    { id: 'points', label: 'Reward Points' }
  ];

  return (
    <Paper 
      elevation={0} 
      sx={{ 
        overflow: 'hidden', 
        mb: 3, 
        position: 'relative',
        borderRadius: 4,
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)'
      }}
    >
      <TableLoaderOverlay loading={isLoading} message="Processing..." />
      <Box sx={{ p: 2, bgcolor: '#ffffff', borderBottom: '1px solid #f1f5f9' }}>
        <Typography variant="h6" component="div" sx={{ color: 'secondary.main', fontWeight: 900, letterSpacing: '-0.5px' }}>
          Monthly Aggregates
        </Typography>
      </Box>
      <TableContainer sx={{ maxHeight: 400 }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              {columns.map((col) => (
                <TableCell 
                  key={col.id} 
                  sortDirection={orderBy === col.id ? order : false} 
                  sx={{ 
                    fontWeight: 800, 
                    bgcolor: '#fff5f7', 
                    color: '#e11d48',
                    textTransform: 'uppercase',
                    fontSize: '0.7rem',
                    py: 1.5
                  }}
                >
                  <TableSortLabel
                    active={orderBy === col.id}
                    direction={orderBy === col.id ? order : 'asc'}
                    onClick={() => handleRequestSort(col.id)}
                  >
                    {col.label}
                  </TableSortLabel>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedRewards.map((reward) => (
              <TableRow hover key={`${reward.customerId}_${reward.year}_${reward.month}`}>
                <TableCell sx={{ color: '#64748b', fontSize: '0.85rem' }}>{reward.customerId}</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>{reward?.customerName}</TableCell>
                <TableCell>
                  <Box sx={{ color: 'primary.main', fontWeight: 800, bgcolor: '#eef2ff', px: 1.5, py: 0.5, borderRadius: 1.5, display: 'inline-block', fontSize: '0.9rem' }}>
                    {reward.month}
                  </Box>
                </TableCell>
                <TableCell sx={{ color: '#64748b', fontWeight: 600 }}>{reward.year}</TableCell>
                <TableCell>
                  <Typography sx={{ fontWeight: 900, color: 'secondary.main', fontSize: '1rem' }}>
                    {reward.points.toLocaleString()} <span style={{ fontSize: '0.7rem' }}>PTS</span>
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
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
