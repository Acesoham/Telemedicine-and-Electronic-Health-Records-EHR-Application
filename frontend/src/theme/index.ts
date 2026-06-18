import { createTheme, alpha } from '@mui/material/styles';
import { PaletteOptions } from '@mui/material/styles/createPalette';

// ─────────────────────────────────────────────────────────────────────────────
// MediVault Design System — Healthcare Professional Theme
// ─────────────────────────────────────────────────────────────────────────────

const palette: PaletteOptions = {
  mode: 'light',
  primary: {
    main: '#1565C0',
    light: '#1976D2',
    dark: '#0D47A1',
    contrastText: '#FFFFFF',
  },
  secondary: {
    main: '#00897B',
    light: '#26A69A',
    dark: '#00695C',
    contrastText: '#FFFFFF',
  },
  error: {
    main: '#C62828',
    light: '#EF5350',
    dark: '#B71C1C',
    contrastText: '#FFFFFF',
  },
  warning: {
    main: '#E65100',
    light: '#FF7043',
    dark: '#BF360C',
    contrastText: '#FFFFFF',
  },
  info: {
    main: '#0277BD',
    light: '#0288D1',
    dark: '#01579B',
    contrastText: '#FFFFFF',
  },
  success: {
    main: '#2E7D32',
    light: '#388E3C',
    dark: '#1B5E20',
    contrastText: '#FFFFFF',
  },
  background: {
    default: '#F8FAFC',
    paper: '#FFFFFF',
  },
  text: {
    primary: '#1A2332',
    secondary: '#64748B',
    disabled: '#94A3B8',
  },
  divider: '#E2E8F0',
};

export const theme = createTheme({
  palette,
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2rem',
      fontWeight: 700,
      lineHeight: 1.25,
      letterSpacing: '-0.025em',
      color: '#1A2332',
    },
    h2: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.3,
      letterSpacing: '-0.015em',
      color: '#1A2332',
    },
    h3: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.4,
      color: '#1A2332',
    },
    h4: {
      fontSize: '1.125rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: '1rem',
      fontWeight: 600,
      lineHeight: 1.5,
    },
    h6: {
      fontSize: '0.875rem',
      fontWeight: 600,
      lineHeight: 1.5,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
      color: '#1A2332',
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.6,
      color: '#64748B',
    },
    caption: {
      fontSize: '0.75rem',
      lineHeight: 1.5,
      color: '#64748B',
    },
    subtitle1: {
      fontSize: '0.9375rem',
      fontWeight: 500,
      lineHeight: 1.5,
    },
    subtitle2: {
      fontSize: '0.875rem',
      fontWeight: 500,
      lineHeight: 1.5,
      color: '#64748B',
    },
    button: {
      fontWeight: 600,
      textTransform: 'none',
      letterSpacing: '0.01em',
    },
  },
  shape: {
    borderRadius: 10,
  },
  shadows: [
    'none',
    '0px 1px 2px rgba(0, 0, 0, 0.06), 0px 1px 3px rgba(0, 0, 0, 0.1)',
    '0px 1px 4px rgba(0, 0, 0, 0.06), 0px 2px 6px rgba(0, 0, 0, 0.1)',
    '0px 2px 6px rgba(0, 0, 0, 0.06), 0px 4px 10px rgba(0, 0, 0, 0.1)',
    '0px 4px 8px rgba(0, 0, 0, 0.06), 0px 6px 14px rgba(0, 0, 0, 0.1)',
    '0px 6px 10px rgba(0, 0, 0, 0.06), 0px 8px 18px rgba(0, 0, 0, 0.1)',
    '0px 8px 12px rgba(0, 0, 0, 0.07), 0px 10px 22px rgba(0, 0, 0, 0.1)',
    '0px 10px 14px rgba(0, 0, 0, 0.07), 0px 12px 26px rgba(0, 0, 0, 0.1)',
    '0px 12px 16px rgba(0, 0, 0, 0.07), 0px 14px 30px rgba(0, 0, 0, 0.1)',
    '0px 14px 18px rgba(0, 0, 0, 0.08), 0px 16px 34px rgba(0, 0, 0, 0.1)',
    '0px 16px 20px rgba(0, 0, 0, 0.08), 0px 18px 38px rgba(0, 0, 0, 0.1)',
    '0px 18px 22px rgba(0, 0, 0, 0.08), 0px 20px 42px rgba(0, 0, 0, 0.1)',
    '0px 20px 24px rgba(0, 0, 0, 0.09), 0px 22px 46px rgba(0, 0, 0, 0.12)',
    '0px 22px 26px rgba(0, 0, 0, 0.09), 0px 24px 50px rgba(0, 0, 0, 0.12)',
    '0px 24px 28px rgba(0, 0, 0, 0.1), 0px 26px 54px rgba(0, 0, 0, 0.12)',
    '0px 26px 30px rgba(0, 0, 0, 0.1), 0px 28px 58px rgba(0, 0, 0, 0.12)',
    '0px 28px 32px rgba(0, 0, 0, 0.1), 0px 30px 62px rgba(0, 0, 0, 0.12)',
    '0px 30px 34px rgba(0, 0, 0, 0.11), 0px 32px 66px rgba(0, 0, 0, 0.14)',
    '0px 32px 36px rgba(0, 0, 0, 0.11), 0px 34px 70px rgba(0, 0, 0, 0.14)',
    '0px 34px 38px rgba(0, 0, 0, 0.12), 0px 36px 74px rgba(0, 0, 0, 0.14)',
    '0px 36px 40px rgba(0, 0, 0, 0.12), 0px 38px 78px rgba(0, 0, 0, 0.14)',
    '0px 38px 42px rgba(0, 0, 0, 0.13), 0px 40px 82px rgba(0, 0, 0, 0.16)',
    '0px 40px 44px rgba(0, 0, 0, 0.13), 0px 42px 86px rgba(0, 0, 0, 0.16)',
    '0px 42px 46px rgba(0, 0, 0, 0.14), 0px 44px 90px rgba(0, 0, 0, 0.18)',
    '0px 44px 48px rgba(0, 0, 0, 0.14), 0px 46px 94px rgba(0, 0, 0, 0.18)',
  ],
  components: {
    MuiCssBaseline: {
      styleOverrides: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        
        * {
          box-sizing: border-box;
        }

        html {
          scroll-behavior: smooth;
        }

        ::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        ::-webkit-scrollbar-track {
          background: #F1F5F9;
        }
        ::-webkit-scrollbar-thumb {
          background: #CBD5E1;
          border-radius: 3px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #94A3B8;
        }
      `,
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '10px 20px',
          fontSize: '0.9375rem',
          fontWeight: 600,
          transition: 'all 0.2s ease',
          '&:hover': {
            transform: 'translateY(-1px)',
          },
          '&:active': {
            transform: 'translateY(0)',
          },
        },
        contained: {
          boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.1)',
          '&:hover': {
            boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.15)',
          },
        },
        sizeLarge: {
          padding: '12px 28px',
          fontSize: '1rem',
        },
        sizeSmall: {
          padding: '6px 14px',
          fontSize: '0.8125rem',
        },
      },
    },
    MuiCard: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          border: '1px solid #E2E8F0',
          borderRadius: 12,
          transition: 'box-shadow 0.2s ease, transform 0.2s ease',
          '&:hover': {
            boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.08)',
          },
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: '24px',
          '&:last-child': {
            paddingBottom: '24px',
          },
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
      },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            backgroundColor: '#FFFFFF',
            transition: 'box-shadow 0.2s ease',
            '&:hover fieldset': {
              borderColor: '#1565C0',
            },
            '&.Mui-focused': {
              boxShadow: `0 0 0 3px ${alpha('#1565C0', 0.15)}`,
            },
            '&.Mui-focused fieldset': {
              borderColor: '#1565C0',
              borderWidth: '1.5px',
            },
          },
        },
      },
    },
    MuiPaper: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
        outlined: {
          border: '1px solid #E2E8F0',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
          fontSize: '0.8125rem',
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-head': {
            backgroundColor: '#F8FAFC',
            fontWeight: 600,
            fontSize: '0.8125rem',
            color: '#64748B',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            borderBottom: '2px solid #E2E8F0',
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderColor: '#F1F5F9',
          padding: '14px 16px',
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:last-child td': {
            borderBottom: 0,
          },
          '&:hover': {
            backgroundColor: '#F8FAFC',
          },
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 16,
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          border: 'none',
          boxShadow: '4px 0px 24px rgba(0, 0, 0, 0.08)',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          margin: '2px 8px',
          '&.Mui-selected': {
            backgroundColor: alpha('#1565C0', 0.1),
            color: '#1565C0',
            '&:hover': {
              backgroundColor: alpha('#1565C0', 0.15),
            },
            '& .MuiListItemIcon-root': {
              color: '#1565C0',
            },
          },
          '&:hover': {
            backgroundColor: alpha('#1565C0', 0.05),
          },
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          fontWeight: 600,
        },
      },
    },
    MuiAppBar: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid #E2E8F0',
          color: '#1A2332',
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          textTransform: 'none',
          fontSize: '0.9375rem',
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          height: 6,
        },
      },
    },
    MuiSkeleton: {
      styleOverrides: {
        root: {
          borderRadius: 6,
        },
      },
    },
  },
});

export default theme;
