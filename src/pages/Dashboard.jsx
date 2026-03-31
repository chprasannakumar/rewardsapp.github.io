import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { fetchTransactions, updateTransaction } from '../utils/api';
import { processTransactions } from '../utils/dataProcessor';
import Header from '../components/Header';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';
import TransactionsTable from '../components/TransactionsTable';
import MonthlyRewardsTable from '../components/MonthlyRewardsTable';
import TotalRewardsTable from '../components/TotalRewardsTable';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import { logger } from '../utils/logger';
import Autocomplete from '@mui/material/Autocomplete';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';

import SearchIcon from '@mui/icons-material/Search';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import ClearIcon from '@mui/icons-material/Close';

const Dashboard = () => {
  const [dashboardState, setDashboardState] = useState({
    transactions: [],
    monthlyRewards: [],
    totalRewards: [],
    isLoading: true,
    isUpdating: false,
    error: null
  });

  // Global Filter State
  const [filters, setFilters] = useState({
    userId: 'all',
    month: 'all',
    search: ''
  });

  const months = [
    { value: 'all', label: 'All Months' },
    { value: '0', label: 'January' },
    { value: '1', label: 'February' },
    { value: '2', label: 'March' },
    { value: '3', label: 'April' },
    { value: '4', label: 'May' },
    { value: '5', label: 'June' },
    { value: '6', label: 'July' },
    { value: '7', label: 'August' },
    { value: '8', label: 'September' },
    { value: '9', label: 'October' },
    { value: '10', label: 'November' },
    { value: '11', label: 'December' }
  ];

  const loadData = useCallback(async (showLoading = true) => {
    if (showLoading) {
      setDashboardState(s => ({ ...s, isLoading: true, error: null }));
    } else {
      setDashboardState(s => ({ ...s, isUpdating: true }));
    }

    try {
      const data = await fetchTransactions();
      if (data?.length) {
        const processed = processTransactions(data);
        setDashboardState({
          ...processed,
          isLoading: false,
          isUpdating: false,
          error: null
        });
      } else {
        setDashboardState(s => ({ ...s, isLoading: false, isUpdating: false, error: null }));
      }
    } catch (error) {
      logger.error('Failed to load dashboard data', error);
      setDashboardState(prev => ({
        ...prev,
        isLoading: false,
        isUpdating: false,
        error: error.message || 'Failed to load rewards data'
      }));
    }
  }, []);

  const handleUpdate = async (id, updatedData) => {
    setDashboardState(s => ({ ...s, isUpdating: true }));
    try {
      await updateTransaction(id, updatedData);
      await loadData(false);
    } catch {
      setDashboardState(s => ({ ...s, isUpdating: false, error: 'Update failed' }));
    }
  };

  useEffect(() => {
    loadData();
  }, [loadData]);

  const { transactions, monthlyRewards, totalRewards, isLoading, isUpdating, error } = dashboardState;

  // Unified Filtering Logic
  const filteredData = useMemo(() => {
    let txs = [...transactions];
    let monthly = [...monthlyRewards];
    let total = [...totalRewards];

    // 1. User Filter
    if (filters.userId !== 'all') {
      txs = txs.filter(t => t.customerId === filters.userId);
      monthly = monthly.filter(r => r.customerId === filters.userId);
      total = total.filter(r => r.customerId === filters.userId);
    }

    // 2. Month Filter
    if (filters.month !== 'all') {
      txs = txs.filter(t => new Date(t.purchaseDate).getMonth().toString() === filters.month);
      monthly = monthly.filter(r => {
        // Find month index string (e.g. "December" -> "11")
        const mDate = new Date(`${r.month} 1, ${r.year}`);
        return mDate.getMonth().toString() === filters.month;
      });
      // Leaderboard remains based on users who have data in that month? 
      // Actually leaderboard is usually total. But if month is selected, we filter users with data in that month.
    }

    // 3. Search Filter (Name or Product)
    if (filters.search) {
      const s = filters.search.toLowerCase();
      txs = txs.filter(t => 
        t.customerName.toLowerCase().includes(s) || 
        t.productPurchased.toLowerCase().includes(s)
      );
      monthly = monthly.filter(r => r.customerName.toLowerCase().includes(s));
      total = total.filter(r => r.customerName.toLowerCase().includes(s));
    }

    return { txs, monthly, total };
  }, [transactions, monthlyRewards, totalRewards, filters]);

  const updateFilters = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({ userId: 'all', month: 'all', search: '' });
  };

  return (
    <Box sx={{ pb: 8, bgcolor: '#f8fafc', minHeight: '100vh' }}>
      <Header />

      <Container maxWidth={false} sx={{ px: { xs: 2, lg: 6 } }}>
        {isLoading ? (
          <Loader />
        ) : error ? (
          <ErrorMessage 
            message={error} 
            onRetry={() => loadData()} 
          />
        ) : (
          <>
            {/* Unified Premium Filter Bar */}
            <Box sx={{ 
              mb: 4, 
              display: 'flex', 
              flexWrap: 'wrap',
              justifyContent: 'flex-start', 
              alignItems: 'center', 
              gap: 2,
              p: 2,
              bgcolor: '#ffffff',
              borderRadius: 4,
              border: '1px solid #e2e8f0',
              boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mr: 1 }}>
                <FilterAltIcon sx={{ color: 'primary.main' }} />
                <Typography sx={{ fontWeight: 800, color: '#1e293b' }}>Filters:</Typography>
              </Box>

              <Autocomplete
                size="small"
                sx={{ minWidth: 200 }}
                options={totalRewards}
                getOptionLabel={(option) => option?.customerName || ''}
                isOptionEqualToValue={(option, value) => option?.customerId === value?.customerId}
                value={totalRewards.find(u => u.customerId === filters.userId) || null}
                onChange={(e, newValue) => updateFilters('userId', newValue?.customerId ?? 'all')}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Customer"
                    placeholder="All Customers"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3, fontWeight: 600 } }}
                  />
                )}
              />

              <FormControl size="small" sx={{ minWidth: 160 }}>
                <InputLabel>Month</InputLabel>
                <Select
                  label="Month"
                  value={filters.month}
                  onChange={(e) => updateFilters('month', e.target.value)}
                  sx={{ borderRadius: 3, fontWeight: 600 }}
                >
                  {months.map(m => (
                    <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                placeholder="Search name or product..."
                size="small"
                value={filters.search}
                onChange={(e) => updateFilters('search', e.target.value)}
                sx={{ flexGrow: 1, minWidth: 200, '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                  endAdornment: filters.search && (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => updateFilters('search', '')}>
                        <ClearIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />

              <IconButton onClick={clearFilters} color="error" title="Clear All Filters" sx={{ bgcolor: '#fff1f2' }}>
                <ClearIcon />
              </IconButton>
            </Box>

            <Grid container spacing={5}>
              <Grid item xs={12}>
                <TransactionsTable 
                  transactions={filteredData.txs} 
                  onUpdate={handleUpdate}
                  isLoading={isUpdating}
                />
              </Grid>
              <Grid container item xs={12} spacing={5}>
                <Grid item xs={12} lg={4}>
                  <TotalRewardsTable 
                    rewards={filteredData.total} 
                    isLoading={isUpdating}
                  />
                </Grid>
                <Grid item xs={12} lg={8}>
                  <MonthlyRewardsTable 
                    rewards={filteredData.monthly} 
                    isLoading={isUpdating}
                  />
                </Grid>
              </Grid>
            </Grid>
          </>
        )}
      </Container>
    </Box>
  );
};

export default Dashboard;
