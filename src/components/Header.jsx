import React from 'react';
import { useAuth } from '../context/AuthContext';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import LogoutIcon from '@mui/icons-material/Logout';

const Header = () => {
  const { user, logout } = useAuth();

  return (
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
        zIndex: 1100
      }}
    >
      <Toolbar>
        <WorkspacePremiumIcon sx={{ mr: 1, fontSize: 32, color: 'primary.main' }} />
        <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 800, letterSpacing: '-0.5px' }}>
          Rewards<span style={{ color: '#4f46e5' }}>Platform</span>
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <Typography variant="body2" sx={{ display: { xs: 'none', sm: 'block' }, fontWeight: 500 }}>
            Hello, <span style={{ color: '#4f46e5', fontWeight: 700 }}>{user?.username}</span>
          </Typography>
          <Button 
            color="primary" 
            onClick={logout} 
            startIcon={<LogoutIcon />}
            variant="contained"
            size="small"
            sx={{ px: 2 }}
          >
            Logout
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
