/**
 * Application-wide reusable constants
 */

export const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  
  export const MONTH_FILTER_OPTIONS = [
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
  
  export const DEFAULT_ROWS_PER_PAGE = 5;
  
  export const ROWS_PER_PAGE_OPTIONS = [5, 10, 25];
  
  export const SORT_DIRECTION = {
    ASC: 'asc',
    DESC: 'desc',
  };
  
  export const FILTER_DEFAULTS = {
    userId: 'all',
    month: 'all',
    search: '',
  };
  
  export const TABLE_COLORS = {
    transactions: {
      headerBg: '#f8fafc',
      headerText: '#475569',
      title: '#1e293b',
    },
    monthly: {
      headerBg: '#fff5f7',
      headerText: '#e11d48',
    },
    total: {
      headerBg: '#ecfdf5',
      headerText: '#059669',
    },
  };