import React, { useState } from 'react';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Chip,
  useTheme,
  useMediaQuery,
  Tooltip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  LocalHospital as LogoIcon,
  ChevronLeft as ChevronLeftIcon,
  Logout as LogoutIcon,
  AccountCircle as AccountIcon,
  NotificationsOutlined as NotificationsIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

interface DashboardLayoutProps {
  children: React.ReactNode;
  navItems: NavItem[];
  title?: string;
}

const DRAWER_WIDTH = 260;
const COLLAPSED_WIDTH = 70;

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, navItems, title }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const { user, profile, logout, role } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const drawerWidth = isMobile ? DRAWER_WIDTH : collapsed ? COLLAPSED_WIDTH : DRAWER_WIDTH;

  const handleLogout = async () => {
    setAnchorEl(null);
    await logout();
    navigate('/login');
  };

  const getDisplayName = () => {
    if (profile && typeof profile === 'object' && 'firstName' in profile) {
      return `${(profile as { firstName: string; lastName: string }).firstName} ${(profile as { firstName: string; lastName: string }).lastName}`;
    }
    return user?.email?.split('@')[0] || 'User';
  };

  const getRoleBadgeColor = () => {
    if (role === 'ADMIN') return 'error';
    if (role === 'DOCTOR') return 'secondary';
    return 'primary';
  };

  const drawerContent = (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: 'linear-gradient(180deg, #0D47A1 0%, #1565C0 50%, #00695C 100%)',
        color: 'white',
      }}
    >
      {/* Logo */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed && !isMobile ? 'center' : 'space-between',
          p: 2,
          pt: 2.5,
          pb: 2.5,
          minHeight: 72,
        }}
      >
        {(!collapsed || isMobile) && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: '10px',
                background: 'rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <LogoIcon sx={{ fontSize: 22, color: 'white' }} />
            </Box>
            <Typography
              variant="h6"
              sx={{ fontWeight: 800, color: 'white', letterSpacing: '-0.01em', lineHeight: 1 }}
            >
              MediVault
            </Typography>
          </Box>
        )}
        {collapsed && !isMobile && (
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: '10px',
              background: 'rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <LogoIcon sx={{ fontSize: 22, color: 'white' }} />
          </Box>
        )}
        {!isMobile && (
          <IconButton
            onClick={() => setCollapsed(!collapsed)}
            sx={{ color: 'rgba(255,255,255,0.7)', p: 0.5 }}
            size="small"
          >
            <ChevronLeftIcon
              sx={{
                transform: collapsed ? 'rotate(180deg)' : 'none',
                transition: 'transform 0.2s',
              }}
            />
          </IconButton>
        )}
      </Box>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.12)' }} />

      {/* Navigation */}
      <List sx={{ flex: 1, pt: 2, px: 1 }}>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
          return (
            <Tooltip
              key={item.path}
              title={collapsed && !isMobile ? item.label : ''}
              placement="right"
            >
              <ListItemButton
                onClick={() => {
                  navigate(item.path);
                  if (isMobile) setMobileOpen(false);
                }}
                sx={{
                  mb: 0.5,
                  borderRadius: 2,
                  minHeight: 46,
                  justifyContent: collapsed && !isMobile ? 'center' : 'flex-start',
                  px: collapsed && !isMobile ? 1 : 2,
                  color: isActive ? 'white' : 'rgba(255,255,255,0.65)',
                  backgroundColor: isActive ? 'rgba(255,255,255,0.18)' : 'transparent',
                  '&:hover': {
                    backgroundColor: isActive
                      ? 'rgba(255,255,255,0.22)'
                      : 'rgba(255,255,255,0.08)',
                    color: 'white',
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: collapsed && !isMobile ? 0 : 40,
                    color: 'inherit',
                    justifyContent: 'center',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                {(!collapsed || isMobile) && (
                  <ListItemText
                    primary={item.label}
                    slotProps={{
                      primary: {
                        style: { fontSize: '0.9375rem', fontWeight: isActive ? 600 : 400 },
                      },
                    }}
                  />
                )}
              </ListItemButton>
            </Tooltip>
          );
        })}
      </List>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.12)' }} />

      {/* User info */}
      {(!collapsed || isMobile) && (
        <Box
          sx={{
            p: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            cursor: 'pointer',
            '&:hover': { backgroundColor: 'rgba(255,255,255,0.05)' },
          }}
          onClick={(e) => setAnchorEl(e.currentTarget)}
        >
          <Avatar
            sx={{
              width: 36,
              height: 36,
              background: 'rgba(255,255,255,0.2)',
              fontSize: '0.875rem',
              fontWeight: 600,
            }}
          >
            {getDisplayName().charAt(0).toUpperCase()}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, color: 'white' }} noWrap>
              {getDisplayName()}
            </Typography>
            <Chip
              label={role}
              size="small"
              color={getRoleBadgeColor()}
              sx={{
                height: 18,
                fontSize: '0.65rem',
                fontWeight: 700,
                '& .MuiChip-label': { px: 0.8 },
                backgroundColor: 'rgba(255,255,255,0.2)',
                color: 'white',
              }}
            />
          </Box>
        </Box>
      )}
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: 'background.default' }}>
      {/* Desktop Sidebar */}
      {!isMobile && (
        <Box
          component="nav"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            transition: 'width 0.3s ease',
          }}
        >
          <Box
            sx={{
              width: drawerWidth,
              height: '100vh',
              position: 'fixed',
              top: 0,
              left: 0,
              overflowX: 'hidden',
              transition: 'width 0.3s ease',
            }}
          >
            {drawerContent}
          </Box>
        </Box>
      )}

      {/* Mobile Drawer */}
      {isMobile && (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          sx={{
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              border: 'none',
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}

      {/* Main Content */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Top AppBar */}
        <AppBar
          position="sticky"
          sx={{
            backgroundColor: 'white',
            borderBottom: '1px solid',
            borderColor: 'divider',
            boxShadow: 'none',
          }}
        >
          <Toolbar sx={{ gap: 2 }}>
            {isMobile && (
              <IconButton
                edge="start"
                onClick={() => setMobileOpen(true)}
                aria-label="Open menu"
              >
                <MenuIcon />
              </IconButton>
            )}

            <Typography variant="h6" sx={{ flex: 1, fontWeight: 600, color: 'text.primary' }}>
              {title}
            </Typography>

            <Tooltip title="Notifications">
              <IconButton size="small">
                <NotificationsIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title="Account">
              <IconButton
                onClick={(e) => setAnchorEl(e.currentTarget)}
                size="small"
                id="account-menu-button"
              >
                <Avatar sx={{ width: 34, height: 34, bgcolor: 'primary.main', fontSize: '0.875rem', fontWeight: 700 }}>
                  {getDisplayName().charAt(0).toUpperCase()}
                </Avatar>
              </IconButton>
            </Tooltip>
          </Toolbar>
        </AppBar>

        {/* Page Content */}
        <Box component="main" sx={{ flex: 1, p: { xs: 2, sm: 3, md: 4 }, overflow: 'auto' }}>
          {children}
        </Box>
      </Box>

      {/* Account Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        slotProps={{ paper: { sx: { minWidth: 200, mt: 1, border: '1px solid', borderColor: 'divider' } } }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{getDisplayName()}</Typography>
          <Typography variant="caption" color="text.secondary">{user?.email}</Typography>
        </Box>
        <Divider />
        <MenuItem onClick={() => { setAnchorEl(null); }}>
          <ListItemIcon><AccountIcon fontSize="small" /></ListItemIcon>
          My Profile
        </MenuItem>
        <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
          <ListItemIcon><LogoutIcon fontSize="small" sx={{ color: 'error.main' }} /></ListItemIcon>
          Sign out
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default DashboardLayout;
