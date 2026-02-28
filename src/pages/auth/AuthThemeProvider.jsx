import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import lightTheme from '../../theme/theme';
const AuthThemeProvider = ({ children }) => {
  return (
    <ThemeProvider theme={lightTheme}>
      {children}
    </ThemeProvider>
  );
};
export default AuthThemeProvider;