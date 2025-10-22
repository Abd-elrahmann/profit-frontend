import { createTheme } from '@mui/material';

const theme = createTheme({
  direction: 'rtl',
  palette: {
    primary: {
      main: '#1E40AF',       // blue
      light: '#2563EB',    // blue light
      dark: '#1E3A8A',     // blue dark
      contrastText: '#ffffff'
    },
    secondary: {
      main: '#f0f0f0',     // gray
      light: '#ffffff',
      dark: '#cccccc',
      contrastText: '#2a2a2a'
    },
    error: {
      main: '#D91656',     // red
      light: '#e44479',
      dark: '#970f3c',
      contrastText: '#ffffff'
    },
    background: {
      default: '#f5f5f5',
      main: '#1E40AF',
      paper: '#ffffff'     
    },
    text: {
      main: '#ffffff',
      primary: '#2a2a2a',
      secondary: '#1E40AF',
      black: '#2a2a2a'
    }
  },

  typography: {
    fontFamily: '"Cairo", "Tajawal", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 600,
      color: '#2a2a2a'
    },
    h2: {
      fontWeight: 500,
      color: '#2a2a2a'
    },
    h3: {
      fontWeight: 500,
      color: '#2a2a2a'
    },
    body1: {
      color: '#2a2a2a'
    }
  },

  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500,
          padding: '8px 24px'
        },
        containedPrimary: {
          '&:hover': {
            backgroundColor: '#2563EB'
          }
        },
        containedSecondary: {
          '&:hover': {
            backgroundColor: '#eeeeee'
          }
        }
      }
    },

    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.05)'
        }
      }
    },

    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            backgroundColor: '#ffffff'
          }
        }
      }
    }
  }
});

export default theme;