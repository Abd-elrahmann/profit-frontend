import { createTheme } from '@mui/material';

// قيم الثيم المشتركة
const commonPalette = {
  primary: {
    main: '#2E8B45',       // green
    light: '#63947F',    // green light
    dark: '#2E8B45',     // green dark
    contrastText: '#ffffff'
  },
  error: {
    main: '#D91656',     // red
    light: '#e44479',
    dark: '#970f3c',
    contrastText: '#ffffff'
  }
};

// ثيم الوضع الفاتح
const lightTheme = createTheme({
  direction: 'rtl',
  palette: {
    mode: 'light',
    ...commonPalette,
    secondary: {
      main: '#f0f0f0',     // gray
      light: '#ffffff',
      dark: '#cccccc',
      contrastText: '#2a2a2a'
    },
    background: {
      default: '#fafafa',
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

// ثيم الوضع المظلم
const darkTheme = createTheme({
  direction: 'rtl',
  palette: {
    mode: 'dark',
    ...commonPalette,
    secondary: {
      main: '#424242',     // gray
      light: '#616161',
      dark: '#212121',
      contrastText: '#ffffff'
    },
    background: {
      default: '#1a1a1a', // خلفية سوداء أفتح قليلاً
      main: '#1E40AF',
      paper: '#1e1e1e'
    },
    text: {
      main: '#ffffff',
      primary: '#ffffff',
      secondary: '#90caf9',
      black: '#ffffff'
    }
  },

  typography: {
    fontFamily: '"Cairo", "Tajawal", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 600,
      color: '#ffffff'
    },
    h2: {
      fontWeight: 500,
      color: '#ffffff'
    },
    h3: {
      fontWeight: 500,
      color: '#ffffff'
    },
    body1: {
      color: '#ffffff'
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
            backgroundColor: '#5f5f5f'
          }
        }
      }
    },

    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.3)',
          backgroundColor: '#1e1e1e'
        }
      }
    },

    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            backgroundColor: '#2a2a2a'
          }
        }
      }
    },

    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#1e1e1e !important'
        }
      }
    }
  }
});

// دالة للحصول على الثيم المناسب
export const getTheme = (isDarkMode) => {
  return isDarkMode ? darkTheme : lightTheme;
};

export default lightTheme;