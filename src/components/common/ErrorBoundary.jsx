import React from 'react';
import PropTypes from 'prop-types';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

/**
 * ErrorBoundary catches rendering errors in its subtree and shows a fallback UI
 * instead of crashing the whole application.
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      errorMessage: error?.message ?? 'An unexpected error occurred.',
    };
  }

  componentDidCatch(error, info) {
    // In production this would forward to an external monitoring service.
    if (typeof console !== 'undefined') {
      console.error('[ErrorBoundary] Caught error:', error, info);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, errorMessage: '' });
  };

  render() {
    const { hasError, errorMessage } = this.state;
    const { children, fallback } = this.props;

    if (hasError) {
      if (fallback) return fallback(errorMessage, this.handleReset);

      return (
        <Paper
          elevation={3}
          sx={{
            p: '2rem',
            textAlign: 'center',
            maxWidth: '31.25rem',
            mx: 'auto',
            mt: '2rem',
          }}
        >
          <Box sx={{ mb: '1rem' }}>
            <ErrorOutlineIcon color="error" sx={{ fontSize: '3rem' }} />
          </Box>
          <Typography variant="h5" color="error" gutterBottom>
            Something went wrong
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            {errorMessage}
          </Typography>
          <Button variant="outlined" color="primary" onClick={this.handleReset}>
            Try Again
          </Button>
        </Paper>
      );
    }

    return children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
  /** Optional render-prop for a custom fallback UI: (errorMessage, reset) => ReactNode */
  fallback: PropTypes.func,
};

export default ErrorBoundary;
