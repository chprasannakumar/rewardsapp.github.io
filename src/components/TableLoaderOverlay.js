import React from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';

const TableLoaderOverlay = ({ loading, message = 'Recalculating points...' }) => {
  if (!loading) return null;

  return (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: alpha('#fff', 0.8),
        backdropFilter: 'blur(0.125rem)',
        zIndex: 10,
        borderRadius: 'inherit',
      }}
    >
      <CircularProgress size={40} thickness={4} />
      <Typography
        variant="body2"
        sx={{ mt: '0.5rem', fontWeight: 700, color: 'primary.main', textTransform: 'uppercase', letterSpacing: '0.0625rem' }}
      >
        {message}
      </Typography>
    </Box>
  );
};

TableLoaderOverlay.displayName = 'TableLoaderOverlay';

TableLoaderOverlay.propTypes = {
  loading: PropTypes.bool.isRequired,
  message: PropTypes.string,
};

export default TableLoaderOverlay;
