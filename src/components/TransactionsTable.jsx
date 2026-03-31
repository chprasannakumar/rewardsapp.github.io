import React, { useState, useMemo, useEffect } from 'react';
import PropTypes from 'prop-types';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Close';
import CircularProgress from '@mui/material/CircularProgress';
import ReusableTable from './ReusableTable';

const TransactionsTable = ({ transactions, onUpdate, isLoading }) => {
  const [order, setOrder] = useState('desc');
  const [orderBy, setOrderBy] = useState('purchaseDate');
  const [page, setPage] = useState(0);
  const rowsPerPage = 5;

  // Inline editing state
  const [editId, setEditId] = useState(null);
  const [editPrice, setEditPrice] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const startEdit = (tx) => {
    setEditId(tx.id);
    setEditPrice(tx.price.toString());
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditPrice('');
  };

  const saveEdit = async (tx) => {
    const newPrice = parseFloat(editPrice);
    if (isNaN(newPrice) || newPrice < 0) {
      alert('Invalid price value');
      return;
    }
    setIsSaving(true);
    try {
      if (onUpdate) {
        await onUpdate(tx.id, { price: newPrice });
      }
      setEditId(null);
      setEditPrice('');
    } catch {
      console.error('Update failed');
    } finally {
      setIsSaving(false);
    }
  };

  const sortedTransactions = useMemo(() => {
    return [...transactions].sort((a, b) => {
      let aValue = a[orderBy];
      let bValue = b[orderBy];
      if (orderBy === 'purchaseDate') {
        aValue = new Date(a.purchaseDate).getTime();
        bValue = new Date(b.purchaseDate).getTime();
      }
      if (bValue < aValue) return order === 'asc' ? 1 : -1;
      if (bValue > aValue) return order === 'asc' ? -1 : 1;
      return 0;
    });
  }, [transactions, order, orderBy]);

  const pagedTransactions = sortedTransactions.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  useEffect(() => {
    setPage(0);
  }, [transactions.length]);

  const cols = [
    { id: 'id', label: 'ID' },
    { id: 'customerName', label: 'Customer Name' },
    { id: 'purchaseDate', label: 'Purchase Date' },
    { id: 'productPurchased', label: 'Product' },
    { id: 'price', label: 'Price' },
    { id: 'points', label: 'Points Earned' },
  ];

  const renderCell = (colId, tx) => {
    switch (colId) {
      case 'id':
        return <span style={{ color: '#64748b', fontWeight: 600 }}>#{tx.id}</span>;
      case 'customerName':
        return <span style={{ fontWeight: 700, color: '#1e293b' }}>{tx?.customerName}</span>;
      case 'purchaseDate':
        return (
          <span style={{ color: '#64748b' }}>
            {new Date(tx.purchaseDate).toLocaleDateString(undefined, { dateStyle: 'medium' })}
          </span>
        );
      case 'productPurchased':
        return (
          <Box sx={{ color: 'primary.main', fontWeight: 700, bgcolor: '#eef2ff', px: 1.5, py: 0.5, borderRadius: 1.5, display: 'inline-block' }}>
            {tx?.productPurchased}
          </Box>
        );
      case 'price':
        return editId === tx.id ? (
          <TextField
            size="small"
            value={editPrice}
            onChange={(e) => setEditPrice(e.target.value)}
            type="number"
            sx={{ width: 120, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            autoFocus
          />
        ) : (
          <span style={{ fontWeight: 800 }}>
            ${Number(tx.price).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </span>
        );
      case 'points':
        return (
          <Box sx={{ fontWeight: 900, color: tx.points > 0 ? 'secondary.main' : '#94a3b8', fontSize: '1.1rem', display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
            {tx.points} <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>PTS</span>
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <ReusableTable
      columns={cols}
      rows={pagedTransactions}
      rowKey={(tx) => tx.id}
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
        <Typography variant="caption" sx={{ fontWeight: 800, color: 'primary.main', bgcolor: '#eef2ff', px: 2, py: 1, borderRadius: 2, whiteSpace: 'nowrap' }}>
          {transactions.length} Records Shown
        </Typography>
      }
      pagination={{
        page,
        rowsPerPage,
        count: transactions.length,
        onPageChange: (e, newPage) => setPage(newPage),
      }}
    />
  );
};

TransactionsTable.propTypes = {
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
  onUpdate: PropTypes.func,
  isLoading: PropTypes.bool,
};

export default TransactionsTable;
