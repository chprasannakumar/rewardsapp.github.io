import React from 'react';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';

const Loader = () => (
  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 200 }}>
    <CircularProgress size={48} />
    <Typography color="text.secondary" sx={{ mt: 2 }}>
      Loading rewards data...
    </Typography>
  </Box>
);

export default Loader;
