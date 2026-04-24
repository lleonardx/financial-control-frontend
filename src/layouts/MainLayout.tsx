import { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Container,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  alpha,
  useTheme
} from '@mui/material';

import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import AccountBalanceRoundedIcon from '@mui/icons-material/AccountBalanceRounded';
import AccountBalanceWalletRoundedIcon from '@mui/icons-material/AccountBalanceWalletRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import { useAuth } from '../auth/AuthContext';

const drawerWidth = 280;

const menuItems = [
  {
    label: 'Dashboard',
    path: '/dashboard',
    icon: <DashboardRoundedIcon />
  },
  {
    label: 'Contas',
    path: '/accounts',
    icon: <AccountBalanceRoundedIcon />
  },
  {
    label: 'Transações',
    path: '/transactions',
    icon: <ReceiptLongRoundedIcon />
  }
];

export function MainLayout() {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const currentTitle =
    menuItems.find((item) => location.pathname === item.path)?.label || 'Dashboard';

  const drawerContent = (
    <Box
      sx={{
        height: '100%',
        bgcolor: '#0f172a',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 3,
              display: 'grid',
              placeItems: 'center',
              bgcolor: 'rgba(255,255,255,0.12)',
              border: '1px solid rgba(255,255,255,0.16)'
            }}
          >
            <AccountBalanceWalletRoundedIcon />
          </Box>

          <Box>
            <Typography sx={{ fontWeight: 900, fontSize: 18 }}>
              FinancialControl
            </Typography>
            <Typography sx={{ fontSize: 12, opacity: 0.7 }}>
              Controle financeiro
            </Typography>
          </Box>
        </Box>
      </Box>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.10)' }} />

      <List sx={{ px: 2, py: 2, flex: 1 }}>
        {menuItems.map((item) => {
          const active =
            location.pathname === item.path ||
            (item.path === '/dashboard' && location.pathname === '/');

          return (
            <ListItemButton
              key={item.path}
              onClick={() => {
                navigate(item.path);
                setMobileOpen(false);
              }}
              sx={{
                mb: 1,
                borderRadius: 3,
                color: active ? '#fff' : 'rgba(255,255,255,0.72)',
                bgcolor: active ? 'rgba(37, 99, 235, 0.95)' : 'transparent',
                '&:hover': {
                  bgcolor: active ? 'rgba(37, 99, 235, 1)' : 'rgba(255,255,255,0.08)'
                }
              }}
            >
              <ListItemIcon sx={{ color: 'inherit', minWidth: 38 }}>
                {item.icon}
              </ListItemIcon>

              <ListItemText
                primary={item.label}
                slotProps={{
                  primary: {
                    sx: {
                      fontWeight: active ? 800 : 600
                    }
                  }
                }}
              />
            </ListItemButton>
          );
        })}
      </List>

      <Box sx={{ p: 2 }}>
        <Box
          sx={{
            p: 2,
            borderRadius: 4,
            bgcolor: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.12)'
          }}
        >
          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
            <Avatar sx={{ bgcolor: '#2563eb', fontWeight: 800 }}>
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </Avatar>

            <Box sx={{ minWidth: 0 }}>
              <Typography
                sx={{
                  fontWeight: 800,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
                {user?.name}
              </Typography>

              <Typography
                sx={{
                  fontSize: 12,
                  opacity: 0.7,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
                {user?.email}
              </Typography>
            </Box>
          </Box>

          <Button
            fullWidth
            startIcon={<LogoutRoundedIcon />}
            onClick={handleLogout}
            sx={{
              mt: 2,
              color: '#fff',
              borderRadius: 2,
              textTransform: 'none',
              bgcolor: 'rgba(239,68,68,0.16)',
              '&:hover': {
                bgcolor: 'rgba(239,68,68,0.26)'
              }
            }}
          >
            Sair
          </Button>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f5f7fb' }}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          bgcolor: alpha(theme.palette.background.paper, 0.86),
          backdropFilter: 'blur(14px)',
          color: 'text.primary',
          borderBottom: `1px solid ${theme.palette.divider}`
        }}
      >
        <Toolbar sx={{ minHeight: 72 }}>
          <IconButton
            edge="start"
            onClick={() => setMobileOpen(true)}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuRoundedIcon />
          </IconButton>

          <Box>
            <Typography sx={{ fontWeight: 900, fontSize: 20 }}>
              {currentTitle}
            </Typography>
            <Typography sx={{ color: 'text.secondary', fontSize: 14 }}>
              Gerencie seu controle financeiro
            </Typography>
          </Box>
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              border: 0
            }
          }}
        >
          {drawerContent}
        </Drawer>

        <Drawer
          variant="permanent"
          open
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              border: 0
            }
          }}
        >
          {drawerContent}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          pt: 11,
          pb: 4,
          minWidth: 0
        }}
      >
        <Container maxWidth="xl">
          <Outlet />
        </Container>
      </Box>
    </Box>
  );
}