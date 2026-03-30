import React, { useState, useMemo, useEffect } from 'react';
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
import TablePagination from '@mui/material/TablePagination';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Close';
import TableLoaderOverlay from './TableLoaderOverlay';
import CircularProgress from '@mui/material/CircularProgress';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import ClearIcon from '@mui/icons-material/Clear';

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
      alert("Invalid price value");
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

  // Sort data during rendering
  const sortedTransactions = useMemo(() => {
    return [...transactions].sort((a, b) => {
      let aValue = a[orderBy];
      let bValue = b[orderBy];

      if (orderBy === 'purchaseDate') {
        aValue = new Date(a.purchaseDate).getTime();
        bValue = new Date(b.purchaseDate).getTime();
      }

      if (bValue < aValue) {
        return order === 'asc' ? 1 : -1;
      }
      if (bValue > aValue) {
        return order === 'asc' ? -1 : 1;
      }
      return 0;
    });
  }, [transactions, order, orderBy]);

  const pagedTransactions = sortedTransactions.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  // Reset page when data changes (filters applied in parent)
  useEffect(() => {
    setPage(0);
  }, [transactions.length]);

  if (!transactions?.length && !isLoading) {
    return <Typography color="text.secondary">No transactions found.</Typography>;
  }

  const cols = [
    { id: 'id', label: 'ID' },
    { id: 'customerName', label: 'Customer Name' },
    { id: 'purchaseDate', label: 'Purchase Date' },
    { id: 'productPurchased', label: 'Product' },
    { id: 'price', label: 'Price' },
    { id: 'points', label: 'Points Earned' },
    { id: 'actions', label: 'Actions' }
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
      <Box sx={{ 
        p: 3, 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        bgcolor: '#ffffff', 
        borderBottom: '1px solid #f1f5f9' 
      }}>
        <Box>
          <Typography variant="h5" component="div" sx={{ color: '#1e293b', fontWeight: 900, letterSpacing: '-0.5px' }}>
            Recent Transactions
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b', mt: 0.5 }}>
            Detailed log of all customer purchases and reward earnings
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Typography variant="caption" sx={{ fontWeight: 800, color: 'primary.main', bgcolor: '#eef2ff', px: 2, py: 1, borderRadius: 2, whiteSpace: 'nowrap' }}>
            {transactions.length} Records Shown
          </Typography>
        </Box>
      </Box>
      <TableContainer sx={{ maxHeight: 600 }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              {cols.map((col) => (
                <TableCell 
                  key={col.id} 
                  sortDirection={orderBy === col.id ? order : false} 
                  sx={{ 
                    fontWeight: 800, 
                    bgcolor: '#f8fafc',
                    color: '#475569',
                    py: 2,
                    textTransform: 'uppercase',
                    fontSize: '0.75rem',
                    letterSpacing: '1px'
                  }}
                >
                  {col.id === 'actions' ? col.label : (
                    <TableSortLabel
                      active={orderBy === col.id}
                      direction={orderBy === col.id ? order : 'asc'}
                      onClick={() => handleRequestSort(col.id)}
                    >
                      {col.label}
                    </TableSortLabel>
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {pagedTransactions.map((tx) => (
              <TableRow hover key={tx.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                <TableCell sx={{ color: '#64748b', fontWeight: 600 }}>#{tx.id}</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#1e293b' }}>{tx?.customerName}</TableCell>
                <TableCell sx={{ color: '#64748b' }}>{new Date(tx.purchaseDate).toLocaleDateString(undefined, { dateStyle: 'medium' })}</TableCell>
                <TableCell>
                  <Box sx={{ color: 'primary.main', fontWeight: 700, bgcolor: '#eef2ff', px: 1.5, py: 0.5, borderRadius: 1.5, display: 'inline-block' }}>
                    {tx?.productPurchased}
                  </Box>
                </TableCell>
                <TableCell sx={{ fontWeight: 800 }}>
                  {editId === tx.id ? (
                    <TextField
                      size="small"
                      value={editPrice}
                      onChange={(e) => setEditPrice(e.target.value)}
                      type="number"
                      sx={{ width: 120, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                      autoFocus
                    />
                  ) : (
                    `$${Number(tx.price).toLocaleString(undefined, { minimumFractionDigits: 2 })}`
                  )}
                </TableCell>
                <TableCell>
                  <Box sx={{ 
                    fontWeight: 900, 
                    color: tx.points > 0 ? 'secondary.main' : '#94a3b8',
                    fontSize: '1.1rem',
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: 0.5
                  }}>
                    {tx.points} <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>PTS</span>
                  </Box>
                </TableCell>
                <TableCell>
                  {editId === tx.id ? (
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton 
                        size="small" 
                        color="primary" 
                        onClick={() => saveEdit(tx)} 
                        sx={{ bgcolor: '#eff6ff' }}
                        disabled={isSaving}
                      >
                        {isSaving ? <CircularProgress size={20} /> : <SaveIcon fontSize="small" />}
                      </IconButton>
                      <IconButton 
                        size="small" 
                        color="error" 
                        onClick={cancelEdit} 
                        sx={{ bgcolor: '#fef2f2' }}
                        disabled={isSaving}
                      >
                        <CancelIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  ) : (
                    <IconButton size="small" color="primary" onClick={() => startEdit(tx)} sx={{ border: '1px solid #e2e8f0' }}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Box sx={{ p: 1, borderTop: '1px solid #f1f5f9' }}>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={transactions.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          sx={{ border: 0 }}
        />
      </Box>
    </Paper>
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
