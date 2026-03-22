import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import GavelRoundedIcon from '@mui/icons-material/GavelRounded';
import FactCheckRoundedIcon from '@mui/icons-material/FactCheckRounded';
import StorefrontRoundedIcon from '@mui/icons-material/StorefrontRounded';
import {
  AppBar,
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Toolbar,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import type { PropsWithChildren } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/context/AuthContext';
import { getNavItemsForRole } from '@/shared/utils/roleAccess';

const drawerWidth = 250;

const navIconByPath: Record<string, JSX.Element> = {
  '/': <DashboardRoundedIcon fontSize="small" />,
  '/transactions': <ReceiptLongRoundedIcon fontSize="small" />,
  '/rules': <GavelRoundedIcon fontSize="small" />,
  '/audit': <FactCheckRoundedIcon fontSize="small" />,
  '/merchants': <StorefrontRoundedIcon fontSize="small" />,
};

export const AppLayout = ({ children }: PropsWithChildren) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, session } = useAuth();
  const navItems = getNavItemsForRole(session.role);

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Toolbar sx={{ minHeight: 76, alignItems: 'center' }}>
        <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: 0.2 }}>
          Payzen
        </Typography>
      </Toolbar>
      <Divider />
      <List sx={{ px: 1.25, py: 1.25 }}>
        {navItems.map((item) => (
          <ListItemButton
            key={item.path}
            selected={location.pathname === item.path}
            onClick={() => {
              navigate(item.path);
              setMobileOpen(false);
            }}
            sx={{
              borderRadius: 2,
              mb: 0.5,
              py: 1.15,
              '&.Mui-selected': {
                backgroundColor: 'rgba(15,118,110,0.12)',
                color: '#0f766e',
                fontWeight: 700,
              },
              '&.Mui-selected:hover': {
                backgroundColor: 'rgba(15,118,110,0.18)',
              },
            }}
          >
            <Box sx={{ mr: 1.5, display: 'flex', alignItems: 'center', color: 'inherit' }}>
              {navIconByPath[item.path]}
            </Box>
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          background: 'linear-gradient(120deg, #0f766e 0%, #115e59 65%, #134e4a 100%)',
          boxShadow: '0 6px 18px rgba(0,0,0,0.18)',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setMobileOpen((prev) => !prev)}
            sx={{ mr: 2, display: { sm: 'none' } }}
            aria-label="Open navigation"
          >
            <MenuIcon />
          </IconButton>
          <Box flexGrow={1}>
            <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 700 }}>
              Payzen Operations Console
            </Typography>
          </Box>
          <IconButton
            color="inherit"
            onClick={logout}
            aria-label="Logout"
            sx={{ border: '1px solid rgba(255,255,255,0.3)' }}
          >
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              borderRight: '1px solid rgba(15,118,110,0.15)',
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              borderRight: '1px solid rgba(15,118,110,0.15)',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3 },
          mt: 8,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        {children}
      </Box>
    </Box>
  );
};
