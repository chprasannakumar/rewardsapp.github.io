import React, { useState, useMemo, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import ReusableTable from './ReusableTable';
import ErrorBoundary from './common/ErrorBoundary';
import { DEFAULT_ROWS_PER_PAGE, SORT_DIRECTION } from '../constants';

const COLUMNS = [
  { id: 'id', label: 'ID' },
  { id: 'customerName', label: 'Customer Name' },
  { id: 'purchaseDate', label: 'Purchase Date' },
  { id: 'productPurchased', label: 'Product' },
  { id: 'price', label: 'Price' },
  { id: 'points', label: 'Points Earned' },
];

const TransactionsTableInner = ({ transactions, isLoading }) => {
  const [order, setOrder] = useState(SORT_DIRECTION.DESC);
  const [orderBy, setOrderBy] = useState('purchaseDate');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_ROWS_PER_PAGE);

  const handleRequestSort = useCallback((property) => {
    const isAsc = orderBy === property && order === SORT_DIRECTION.ASC;
    setOrder(isAsc ? SORT_DIRECTION.DESC : SORT_DIRECTION.ASC);
    setOrderBy(property);
  }, [order, orderBy]);

  const sortedTransactions = useMemo(() => {
    if (!Array.isArray(transactions)) return [];
    return [...transactions].sort((a, b) => {
      let aValue = a?.[orderBy] ?? '';
      let bValue = b?.[orderBy] ?? '';
      if (orderBy === 'purchaseDate') {
        aValue = new Date(a?.purchaseDate ?? 0).getTime();
        bValue = new Date(b?.purchaseDate ?? 0).getTime();
      }
      if (orderBy === 'id') {
        aValue = parseInt((a?.id || '').replace(/\D/g, ''), 10) || 0;
        bValue = parseInt((b?.id || '').replace(/\D/g, ''), 10) || 0;
      }
      if (bValue < aValue) return order === SORT_DIRECTION.ASC ? 1 : -1;
      if (bValue > aValue) return order === SORT_DIRECTION.ASC ? -1 : 1;
      return 0;
    });
  }, [transactions, order, orderBy]);

  const pagedTransactions = useMemo(
    () => sortedTransactions.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [sortedTransactions, page, rowsPerPage]
  );

  useEffect(() => {
    setPage(0);
  }, [transactions?.length]);

  const handleRowsPerPageChange = useCallback((e) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  }, []);

  const renderCell = (colId, tx) => {
    switch (colId) {
      case 'id':
        return <span style={{ color: '#64748b', fontWeight: 600 }}>#{tx?.id}</span>;
      case 'customerName':
        return <span style={{ fontWeight: 700, color: '#1e293b' }}>{tx?.customerName ?? '—'}</span>;
      case 'purchaseDate':
        return (
          <span style={{ color: '#64748b' }}>
            {tx?.purchaseDate
              ? new Date(tx.purchaseDate).toLocaleDateString(undefined, { dateStyle: 'medium' })
              : '—'}
          </span>
        );
      case 'productPurchased':
        return (
          <Box sx={{ color: 'primary.main', fontWeight: 700, bgcolor: '#eef2ff', px: '0.375rem', py: '0.125rem', borderRadius: '0.375rem', display: 'inline-block' }}>
            {tx?.productPurchased ?? '—'}
          </Box>
        );
      case 'price':
        return (
          <span style={{ fontWeight: 800 }}>
            ${tx?.price != null ? Number(tx.price).toLocaleString(undefined, { minimumFractionDigits: 2 }) : '0.00'}
          </span>
        );
      case 'points':
        return (
          <Box sx={{ fontWeight: 900, color: (tx?.points ?? 0) > 0 ? 'secondary.main' : '#94a3b8', fontSize: '1.1rem', display: 'flex', alignItems: 'baseline', gap: '0.125rem' }}>
            {tx?.points ?? 0} <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>PTS</span>
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <ReusableTable
      columns={COLUMNS}
      rows={pagedTransactions}
      rowKey={(tx) => tx?.id ?? Math.random()}
      renderCell={renderCell}
      order={order}
      orderBy={orderBy}
      onRequestSort={handleRequestSort}
      title="Recent Transactions"
      titleColor="#1e293b"
      headerBgColor="#f8fafc"
      headerTextColor="#475569"
      isLoading={isLoading}
      maxHeight={600}
      emptyMessage="No transactions found."
      titleExtra={
        <Typography variant="caption" sx={{ fontWeight: 800, color: 'primary.main', bgcolor: '#eef2ff', px: '0.5rem', py: '0.25rem', borderRadius: '0.5rem', whiteSpace: 'nowrap' }}>
          {transactions?.length ?? 0} Records Shown
        </Typography>
      }
      pagination={{
        page,
        rowsPerPage,
        count: sortedTransactions.length,
        onPageChange: (e, newPage) => setPage(newPage),
        onRowsPerPageChange: handleRowsPerPageChange,
      }}
    />
  );
};

TransactionsTableInner.propTypes = {
  transactions: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      customerName: PropTypes.string.isRequired,
      purchaseDate: PropTypes.string.isRequired,
      productPurchased: PropTypes.string.isRequired,
      price: PropTypes.number.isRequired,
      points: PropTypes.number.isRequired,
    })
  ).isRequired,
  isLoading: PropTypes.bool,
};

const TransactionsTable = (props) => (
  <ErrorBoundary>
    <TransactionsTableInner {...props} />
  </ErrorBoundary>
);

export default TransactionsTable;
