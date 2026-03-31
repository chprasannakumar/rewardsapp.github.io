import React, { memo } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';

const Header = memo(() => (
  <AppBar
    position="sticky"
    elevation={0}
    sx={{
      mb: 4,
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
      backdropFilter: 'blur(10px)',
      borderBottom: '1px solid #e2e8f0',
      color: 'text.primary',
      top: 0,
      zIndex: 1100,
    }}
  >
    <Toolbar>
      <WorkspacePremiumIcon sx={{ mr: 1, fontSize: 32, color: 'primary.main' }} />
      <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 800, letterSpacing: '-0.03125rem' }}>
        Rewards<span style={{ color: '#4f46e5' }}>Platform</span>
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
        <Typography variant="body2" sx={{ display: { xs: 'none', sm: 'block' }, fontWeight: 500 }}>
          Hello, <span style={{ color: '#4f46e5', fontWeight: 700 }}>Admin</span>
        </Typography>
      </Box>
    </Toolbar>
  </AppBar>
));

Header.displayName = 'Header';

export default Header;
