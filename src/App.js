import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Container, Box, Typography } from '@mui/material';
import NeuralNetworkSimulator from './components/NeuralNetworkSimulator';
import LanguageToggle from './components/LanguageToggle';
import { LanguageProvider, useLanguage } from './utils/languageContext';
import './App.css';

// Create theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#3f51b5',
    },
    secondary: {
      main: '#f50057',
    },
    background: {
      default: '#f5f8fa',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
  },
});

// 应用内容组件，可以访问语言上下文
const AppContent = () => {
  const { t } = useLanguage();
  
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="lg">
        <Box sx={{ my: 4, textAlign: 'center', position: 'relative' }}>
          <LanguageToggle />
          <Typography variant="h4" component="h1" gutterBottom>
            {t('appTitle')}
          </Typography>
          <NeuralNetworkSimulator />
        </Box>
      </Container>
    </ThemeProvider>
  );
};

function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}

export default App; 