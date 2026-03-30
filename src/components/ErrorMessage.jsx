import React from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

const ErrorMessage = ({ message, onRetry }) => (
  <Paper elevation={3} sx={{ p: 4, textAlign: 'center', maxWidth: 500, mx: 'auto', mt: 4 }}>
    <ErrorOutlineIcon color="error" sx={{ fontSize: 48, mb: 2 }} />
    <Typography variant="h5" color="error" gutterBottom>
      Something went wrong
    </Typography>
    <Typography variant="body1" color="text.secondary" paragraph>
      {message}
    </Typography>
    {onRetry && (
      <Button variant="outlined" color="primary" onClick={onRetry}>
        Try Again
      </Button>
    )}
  </Paper>
);

ErrorMessage.propTypes = {
  message: PropTypes.string.isRequired,
  onRetry: PropTypes.func
};

export default ErrorMessage;
